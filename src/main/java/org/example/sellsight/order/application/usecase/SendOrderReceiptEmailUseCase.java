package org.example.sellsight.order.application.usecase;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.application.dto.OrderItemDto;
import org.example.sellsight.shared.email.EmailMessage;
import org.example.sellsight.shared.email.EmailSender;
import org.example.sellsight.shared.email.EmailTemplates;
import org.example.sellsight.user.domain.model.User;
import org.example.sellsight.user.domain.model.UserId;
import org.example.sellsight.user.domain.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SendOrderReceiptEmailUseCase {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM d, yyyy 'at' HH:mm 'UTC'");

    private final EmailSender emailSender;
    private final UserRepository userRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    public void send(OrderDto order, String paymentIntentId, long paidAmountCents, long shippingCents) {
        Optional<User> maybeUser = userRepository.findById(UserId.from(order.customerId()));
        if (maybeUser.isEmpty()) {
            log.warn("Skipping receipt email for order {} — customer {} not found", order.id(), order.customerId());
            return;
        }

        User user = maybeUser.get();
        BigDecimal itemSubtotal = normalize(order.total());
        BigDecimal shipping     = cents(shippingCents);
        BigDecimal paidTotal    = cents(Math.max(0L, paidAmountCents));
        BigDecimal discount     = itemSubtotal.add(shipping).subtract(paidTotal).max(BigDecimal.ZERO);
        String paymentMethod    = resolvePaymentMethod(paymentIntentId);

        String orderShort = order.id().length() >= 8 ? order.id().substring(0, 8).toUpperCase() : order.id();
        String orderLink  = appUrl("/orders/" + order.id());

        String attachHtml = receiptHtml(user, order, itemSubtotal, shipping, discount, paidTotal, paymentIntentId, paymentMethod);
        String emailHtml  = emailHtml(user, orderShort, order.status(), order.items(), itemSubtotal, shipping, discount, paidTotal, paymentMethod, orderLink);
        String plainText  = plainText(user, order, itemSubtotal, shipping, discount, paidTotal, paymentIntentId, paymentMethod, orderLink);

        String attachName   = "SellSight-Receipt-" + orderShort + ".html";
        String attachBase64 = Base64.getEncoder().encodeToString(attachHtml.getBytes(StandardCharsets.UTF_8));

        EmailMessage message = new EmailMessage(
                user.getEmail().getValue(),
                "Your SellSight receipt — order #" + orderShort,
                plainText,
                emailHtml,
                List.of(new EmailMessage.Attachment(attachName, attachBase64, "text/html"))
        );

        log.info("Sending receipt email orderId={} to={} paidTotal={}", order.id(), user.getEmail().getValue(), fmt(paidTotal));
        emailSender.send(message);
    }

    // ─── Email body (viewed in mail client) ───────────────────────────────────

    private String emailHtml(User user,
                             String orderShort,
                             String status,
                             List<OrderItemDto> items,
                             BigDecimal subtotal,
                             BigDecimal shipping,
                             BigDecimal discount,
                             BigDecimal paidTotal,
                             String paymentMethod,
                             String orderLink) {
        // Items table
        StringBuilder itemRows = new StringBuilder();
        for (OrderItemDto item : items) {
            itemRows.append("""
                    <tr>
                      <td style="padding:12px 16px;font-size:14px;color:#1a1829;font-weight:500;border-bottom:1px solid #f3f1ed">%s</td>
                      <td style="padding:12px 16px;text-align:center;font-size:14px;color:#6b6880;border-bottom:1px solid #f3f1ed">%d</td>
                      <td style="padding:12px 16px;text-align:right;font-size:14px;color:#6b6880;border-bottom:1px solid #f3f1ed">%s</td>
                      <td style="padding:12px 16px;text-align:right;font-size:14px;font-weight:700;color:#1a1829;border-bottom:1px solid #f3f1ed">%s</td>
                    </tr>
                    """.formatted(
                    EmailTemplates.escape(item.productName()),
                    item.quantity(),
                    fmt(item.unitPrice()),
                    fmt(item.subtotal())
            ));
        }

        String itemsSection = """
                <div style="margin:6px 0 20px;border-radius:16px;overflow:hidden;border:1px solid #ede9fe">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                    <tr style="background:#f5f3ff">
                      <td style="padding:10px 16px;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#7c3aed;border-bottom:2px solid #ede9fe">Item</td>
                      <td style="padding:10px 16px;text-align:center;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#7c3aed;border-bottom:2px solid #ede9fe">Qty</td>
                      <td style="padding:10px 16px;text-align:right;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#7c3aed;border-bottom:2px solid #ede9fe">Unit&nbsp;price</td>
                      <td style="padding:10px 16px;text-align:right;font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#7c3aed;border-bottom:2px solid #ede9fe">Subtotal</td>
                    </tr>
                    %s
                  </table>
                </div>
                """.formatted(itemRows);

        // Order summary table
        String summaryTable = """
                <div style="margin:0 0 24px;border-radius:18px;background:#faf9f6;border:1px solid #ede9fe;overflow:hidden">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                    <tr style="background:linear-gradient(135deg,#3b0764,#7c3aed)">
                      <td style="padding:14px 20px;color:rgba(255,255,255,.7);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">Order</td>
                      <td style="padding:14px 20px;text-align:right;color:rgba(255,255,255,.7);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">Status</td>
                    </tr>
                    <tr style="background:#fff">
                      <td style="padding:14px 20px;font-size:22px;font-weight:900;color:#1a1829;font-family:monospace">#%s</td>
                      <td style="padding:14px 20px;text-align:right">
                        <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:#d1fae5;color:#065f46;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.06em">%s</span>
                      </td>
                    </tr>
                    <tr><td colspan="2" style="height:1px;background:#ede9fe"></td></tr>
                    <tr style="background:#fff"><td style="padding:10px 20px;color:#6b6880;font-size:13px">Payment method</td><td style="padding:10px 20px;text-align:right;font-weight:700;color:#1a1829;font-size:13px">%s</td></tr>
                    <tr style="background:#faf9f6"><td style="padding:10px 20px;color:#6b6880;font-size:13px">Items subtotal</td><td style="padding:10px 20px;text-align:right;font-weight:700;color:#1a1829;font-size:13px">%s</td></tr>
                    <tr style="background:#fff"><td style="padding:10px 20px;color:#6b6880;font-size:13px">Shipping</td><td style="padding:10px 20px;text-align:right;font-weight:700;color:#1a1829;font-size:13px">%s</td></tr>
                    <tr style="background:#faf9f6"><td style="padding:10px 20px;color:#6b6880;font-size:13px">Discounts</td><td style="padding:10px 20px;text-align:right;font-weight:700;color:#1a1829;font-size:13px">-%s</td></tr>
                    <tr><td colspan="2" style="height:1px;background:#ede9fe"></td></tr>
                    <tr style="background:#f5f3ff"><td style="padding:14px 20px;font-size:17px;font-weight:900;color:#4c1d95">Total paid</td><td style="padding:14px 20px;text-align:right;font-size:22px;font-weight:900;color:#7c3aed">%s</td></tr>
                  </table>
                </div>
                """.formatted(
                EmailTemplates.escape(orderShort),
                EmailTemplates.escape(status),
                EmailTemplates.escape(paymentMethod),
                fmt(subtotal), fmt(shipping), fmt(discount), fmt(paidTotal)
        );

        return EmailTemplates.action(
                "Your SellSight order receipt is ready.",
                "Receipt",
                "Thanks for your order!",
                EmailTemplates.paragraph("Hi " + EmailTemplates.escape(user.getFirstName()) + ", your payment was successful and your order is confirmed.")
                        + itemsSection
                        + summaryTable
                        + EmailTemplates.paragraph("We'll notify you when your order ships. Check the order page any time for live status updates."),
                "View my order",
                orderLink,
                EmailTemplates.muted("A downloadable HTML receipt is attached to this email.")
        );
    }

    // ─── Receipt attachment (print-quality HTML) ──────────────────────────────

    private String receiptHtml(User user,
                               OrderDto order,
                               BigDecimal subtotal,
                               BigDecimal shipping,
                               BigDecimal discount,
                               BigDecimal paidTotal,
                               String paymentIntentId,
                               String paymentMethod) {
        StringBuilder rows = new StringBuilder();
        for (OrderItemDto item : order.items()) {
            rows.append("""
                    <tr>
                      <td>%s</td>
                      <td style="text-align:right">%d</td>
                      <td style="text-align:right">%s</td>
                      <td style="text-align:right;font-weight:700">%s</td>
                    </tr>
                    """.formatted(
                    EmailTemplates.escape(item.productName()),
                    item.quantity(),
                    fmt(item.unitPrice()),
                    fmt(item.subtotal())
            ));
        }

        String piRow = (paymentIntentId == null || paymentIntentId.isBlank() || paymentIntentId.equals("free-order"))
                ? ""
                : "<div class=\"meta-item\"><strong>Payment ref:</strong> " + EmailTemplates.escape(paymentIntentId) + "</div>";

        String body = """
                <div class="hdr">
                  <h1>SellSight Receipt</h1>
                  <p>Issued %s</p>
                </div>
                <div class="body">
                  <div class="meta">
                    <div class="meta-item"><strong>Customer:</strong> %s %s</div>
                    <div class="meta-item"><strong>Order ID:</strong> %s</div>
                    <div class="meta-item"><strong>Status:</strong> <span class="badge">%s</span></div>
                    <div class="meta-item"><strong>Payment:</strong> %s</div>
                    %s
                  </div>
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style="text-align:right">Qty</th>
                        <th style="text-align:right">Unit price</th>
                        <th style="text-align:right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>%s</tbody>
                  </table>
                  <table class="totals">
                    <tr><td class="label">Items subtotal</td><td style="text-align:right">%s</td></tr>
                    <tr><td class="label">Shipping</td><td style="text-align:right">%s</td></tr>
                    <tr><td class="label">Discounts</td><td style="text-align:right">-%s</td></tr>
                    <tr class="grand"><td>Total paid</td><td style="text-align:right">%s</td></tr>
                  </table>
                </div>
                """.formatted(
                DATE_FMT.format(LocalDateTime.now()),
                EmailTemplates.escape(user.getFirstName()),
                EmailTemplates.escape(user.getLastName()),
                EmailTemplates.escape(order.id()),
                EmailTemplates.escape(order.status()),
                EmailTemplates.escape(paymentMethod),
                piRow,
                rows,
                fmt(subtotal), fmt(shipping), fmt(discount), fmt(paidTotal)
        );

        return EmailTemplates.receiptShell("SellSight Receipt — Order #" + order.id().substring(0, 8).toUpperCase(), body);
    }

    // ─── Plain text fallback ──────────────────────────────────────────────────

    private String plainText(User user,
                             OrderDto order,
                             BigDecimal subtotal,
                             BigDecimal shipping,
                             BigDecimal discount,
                             BigDecimal paidTotal,
                             String paymentIntentId,
                             String paymentMethod,
                             String orderLink) {
        StringBuilder items = new StringBuilder();
        for (OrderItemDto item : order.items()) {
            items.append("  - ").append(item.productName())
                 .append(" x").append(item.quantity())
                 .append(" = ").append(fmt(item.subtotal())).append("\n");
        }
        return "Hi " + user.getFirstName() + ",\n\n"
                + "Your SellSight payment was successful.\n\n"
                + "Order #" + order.id() + "\n"
                + "Status: " + order.status() + "\n"
                + "Payment: " + paymentMethod + "\n"
                + (paymentIntentId != null && !paymentIntentId.isBlank() && !paymentIntentId.equals("free-order")
                    ? "Payment ref: " + paymentIntentId + "\n" : "")
                + "\nItems:\n" + items
                + "\nItems subtotal: " + fmt(subtotal) + "\n"
                + "Shipping:        " + fmt(shipping) + "\n"
                + "Discounts:       -" + fmt(discount) + "\n"
                + "Total paid:      " + fmt(paidTotal) + "\n"
                + "\nTrack your order: " + orderLink + "\n"
                + "A downloadable receipt is attached.\n\n"
                + "Thank you,\nThe SellSight Team";
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private static String resolvePaymentMethod(String paymentIntentId) {
        if (paymentIntentId == null || paymentIntentId.isBlank() || "free-order".equals(paymentIntentId)) {
            return "Free (100% discount)";
        }
        return "Credit / Debit Card";
    }

    private BigDecimal cents(long c) {
        return BigDecimal.valueOf(c).movePointLeft(2).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal normalize(BigDecimal v) {
        return (v == null ? BigDecimal.ZERO : v).setScale(2, RoundingMode.HALF_UP);
    }

    private String fmt(BigDecimal v) {
        return NumberFormat.getCurrencyInstance(Locale.US).format(normalize(v));
    }

    private String fmt(double v) {
        return fmt(BigDecimal.valueOf(v));
    }

    private String appUrl(String path) {
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        return base + path;
    }
}
