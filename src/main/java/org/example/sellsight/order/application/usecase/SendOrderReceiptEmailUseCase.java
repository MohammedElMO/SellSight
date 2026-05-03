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
import java.util.Locale;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class SendOrderReceiptEmailUseCase {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM d, yyyy 'at' HH:mm");

    private final EmailSender emailSender;
    private final UserRepository userRepository;

    @Value("${app.base-url}")
    private String baseUrl;

    public void send(OrderDto order, String paymentIntentId, long paidAmountCents, long shippingCents) {
        Optional<User> maybeUser = userRepository.findById(UserId.from(order.customerId()));
        if (maybeUser.isEmpty()) {
            log.warn("Skipping receipt email for order {} because customer {} was not found",
                    order.id(), order.customerId());
            return;
        }

        User user = maybeUser.get();
        BigDecimal itemSubtotal = normalizeMoney(order.total());
        BigDecimal shipping = centsToMoney(shippingCents);
        BigDecimal paidTotal = centsToMoney(Math.max(0L, paidAmountCents));

        BigDecimal expectedTotal = itemSubtotal.add(shipping);
        BigDecimal discount = expectedTotal.subtract(paidTotal);
        if (discount.compareTo(BigDecimal.ZERO) < 0) {
            discount = BigDecimal.ZERO;
        }

        String orderShort = order.id().length() >= 8 ? order.id().substring(0, 8).toUpperCase() : order.id();
        String status = order.status();
        String orderLink = appUrl("/orders/" + order.id());
        String receiptHtml = receiptHtml(user, order, itemSubtotal, shipping, discount, paidTotal, paymentIntentId);
        String text = receiptText(user, order, itemSubtotal, shipping, discount, paidTotal, paymentIntentId, orderLink);
        String html = emailHtml(user, orderShort, status, itemSubtotal, shipping, discount, paidTotal, orderLink);

        String attachmentName = "SellSight-Receipt-" + orderShort + ".html";
        String attachmentBase64 = Base64.getEncoder().encodeToString(receiptHtml.getBytes(StandardCharsets.UTF_8));

        EmailMessage message = new EmailMessage(
                user.getEmail().getValue(),
                "Your SellSight receipt for order #" + orderShort,
                text,
                html,
                java.util.List.of(new EmailMessage.Attachment(attachmentName, attachmentBase64, "text/html"))
        );
        log.info("Sending order receipt email orderId={} customerId={} to={} paidTotal={} shipping={} attachment={}",
                order.id(), order.customerId(), user.getEmail().getValue(), formatMoney(paidTotal), formatMoney(shipping), attachmentName);
        emailSender.send(message);
        log.info("Order receipt email dispatched orderId={} to={}", order.id(), user.getEmail().getValue());
    }

    private String receiptText(User user,
                               OrderDto order,
                               BigDecimal subtotal,
                               BigDecimal shipping,
                               BigDecimal discount,
                               BigDecimal paidTotal,
                               String paymentIntentId,
                               String orderLink) {
        StringBuilder items = new StringBuilder();
        for (OrderItemDto item : order.items()) {
            items.append("- ")
                    .append(item.productName())
                    .append(" x")
                    .append(item.quantity())
                    .append(" = ")
                    .append(formatMoney(item.subtotal()))
                    .append("\n");
        }
        return "Hi " + user.getFirstName() + ",\n\n"
                + "Thanks for shopping with SellSight. Your payment was successful.\n\n"
                + "Order #" + order.id() + "\n"
                + "Status: " + order.status() + "\n"
                + "Paid total: " + formatMoney(paidTotal) + "\n"
                + "Shipping: " + formatMoney(shipping) + "\n"
                + "Discounts: -" + formatMoney(discount) + "\n"
                + "Items subtotal: " + formatMoney(subtotal) + "\n"
                + (paymentIntentId != null && !paymentIntentId.isBlank() ? "Payment intent: " + paymentIntentId + "\n" : "")
                + "\nItems\n"
                + items
                + "\nTrack your order: " + orderLink + "\n"
                + "You can download the receipt from the email attachment.\n\n"
                + "Thank you for your purchase.\n"
                + "- SellSight";
    }

    private String emailHtml(User user,
                             String orderShort,
                             String status,
                             BigDecimal subtotal,
                             BigDecimal shipping,
                             BigDecimal discount,
                             BigDecimal paidTotal,
                             String orderLink) {
        String summary = """
                <div style="margin:6px 0 24px;padding:20px;border-radius:22px;background:#f8fafc;border:1px solid #e2e8f0">
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="padding:0 0 10px;color:#64748b;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">Order</td>
                      <td style="padding:0 0 10px;text-align:right;color:#64748b;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">Current status</td>
                    </tr>
                    <tr>
                      <td style="padding:0 0 16px;font-size:20px;font-weight:900;color:#0f172a">#%s</td>
                      <td style="padding:0 0 16px;text-align:right;font-size:20px;font-weight:900;color:#0f766e">%s</td>
                    </tr>
                    <tr><td colspan="2" style="height:1px;background:#e2e8f0"></td></tr>
                    <tr><td style="padding:16px 0 8px;color:#475569">Items subtotal</td><td style="padding:16px 0 8px;text-align:right;font-weight:700;color:#0f172a">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#475569">Shipping</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#0f172a">%s</td></tr>
                    <tr><td style="padding:8px 0;color:#475569">Discounts</td><td style="padding:8px 0;text-align:right;font-weight:700;color:#0f172a">-%s</td></tr>
                    <tr><td style="padding:16px 0 0;font-size:18px;font-weight:900;color:#0f172a">Paid total</td><td style="padding:16px 0 0;text-align:right;font-size:22px;font-weight:900;color:#0f766e">%s</td></tr>
                  </table>
                </div>
                """.formatted(
                EmailTemplates.escape(orderShort),
                EmailTemplates.escape(status),
                formatMoney(subtotal),
                formatMoney(shipping),
                formatMoney(discount),
                formatMoney(paidTotal)
        );

        return EmailTemplates.action(
                "Your SellSight order receipt is ready.",
                "Receipt ready",
                "Thank you for your purchase",
                EmailTemplates.paragraph("Hi " + EmailTemplates.escape(user.getFirstName()) + ", your payment was successful. We attached a downloadable receipt to this email.")
                        + summary
                        + EmailTemplates.paragraph("Thanks for choosing SellSight. We will keep you updated as the order status changes."),
                "View order details",
                orderLink,
                EmailTemplates.muted("You can download the full receipt from the HTML attachment included with this email.")
        );
    }

    private String receiptHtml(User user,
                               OrderDto order,
                               BigDecimal subtotal,
                               BigDecimal shipping,
                               BigDecimal discount,
                               BigDecimal paidTotal,
                               String paymentIntentId) {
        StringBuilder lines = new StringBuilder();
        for (OrderItemDto item : order.items()) {
            lines.append("""
                    <tr>
                      <td style="padding:10px;border-bottom:1px solid #e2e8f0">%s</td>
                      <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right">%d</td>
                      <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right">%s</td>
                      <td style="padding:10px;border-bottom:1px solid #e2e8f0;text-align:right">%s</td>
                    </tr>
                    """.formatted(
                    escape(item.productName()),
                    item.quantity(),
                    formatMoney(item.unitPrice()),
                    formatMoney(item.subtotal())
            ));
        }

        String paymentRow = (paymentIntentId == null || paymentIntentId.isBlank())
                ? ""
                : "<p style=\"margin:4px 0;color:#334155\"><strong>Payment intent:</strong> " + escape(paymentIntentId) + "</p>";

        return """
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <title>SellSight Receipt</title>
                </head>
                <body style="margin:0;background:#f8fafc;color:#0f172a;font-family:Arial,Helvetica,sans-serif">
                  <div style="max-width:760px;margin:24px auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
                    <div style="padding:20px 24px;background:#0f766e;color:#ffffff">
                      <h1 style="margin:0;font-size:24px">SellSight Receipt</h1>
                      <p style="margin:6px 0 0;opacity:.9">Issued %s</p>
                    </div>
                    <div style="padding:20px 24px">
                      <p style="margin:4px 0;color:#334155"><strong>Customer:</strong> %s %s</p>
                      <p style="margin:4px 0;color:#334155"><strong>Order ID:</strong> %s</p>
                      <p style="margin:4px 0;color:#334155"><strong>Status:</strong> %s</p>
                      %s
                      <table width="100%%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-collapse:collapse">
                        <thead style="background:#f1f5f9">
                          <tr>
                            <th style="padding:10px;text-align:left;font-size:12px;color:#334155">Item</th>
                            <th style="padding:10px;text-align:right;font-size:12px;color:#334155">Qty</th>
                            <th style="padding:10px;text-align:right;font-size:12px;color:#334155">Unit</th>
                            <th style="padding:10px;text-align:right;font-size:12px;color:#334155">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          %s
                        </tbody>
                      </table>
                      <table width="100%%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-collapse:collapse">
                        <tr><td style="padding:6px 0;color:#475569">Items subtotal</td><td style="padding:6px 0;text-align:right">%s</td></tr>
                        <tr><td style="padding:6px 0;color:#475569">Shipping</td><td style="padding:6px 0;text-align:right">%s</td></tr>
                        <tr><td style="padding:6px 0;color:#475569">Discounts</td><td style="padding:6px 0;text-align:right">-%s</td></tr>
                        <tr><td style="padding:10px 0 0;font-size:18px;font-weight:700">Paid total</td><td style="padding:10px 0 0;text-align:right;font-size:18px;font-weight:700">%s</td></tr>
                      </table>
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(
                DATE_FMT.format(LocalDateTime.now()),
                escape(user.getFirstName()),
                escape(user.getLastName()),
                escape(order.id()),
                escape(order.status()),
                paymentRow,
                lines,
                formatMoney(subtotal),
                formatMoney(shipping),
                formatMoney(discount),
                formatMoney(paidTotal)
        );
    }

    private BigDecimal centsToMoney(long cents) {
        return BigDecimal.valueOf(cents).movePointLeft(2).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal normalizeMoney(BigDecimal value) {
        if (value == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return value.setScale(2, RoundingMode.HALF_UP);
    }

    private String formatMoney(BigDecimal value) {
        NumberFormat format = NumberFormat.getCurrencyInstance(Locale.US);
        return format.format(normalizeMoney(value));
    }

    private String appUrl(String path) {
        String normalizedBase = baseUrl.endsWith("/")
                ? baseUrl.substring(0, baseUrl.length() - 1)
                : baseUrl;
        return normalizedBase + path;
    }

    private String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
