package org.example.sellsight.order.application.usecase;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.lowagie.text.pdf.draw.LineSeparator;
import lombok.extern.slf4j.Slf4j;
import org.example.sellsight.order.application.dto.OrderDto;
import org.example.sellsight.order.application.dto.OrderItemDto;
import org.example.sellsight.user.domain.model.User;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
public final class ReceiptPdfGenerator {

    private static final Color ACCENT       = new Color(124, 58, 237);
    private static final Color ACCENT_SOFT  = new Color(245, 243, 255);
    private static final Color DARK         = new Color(26, 24, 41);
    private static final Color MUTED        = new Color(107, 104, 128);
    private static final Color BORDER_CLR   = new Color(237, 233, 254);
    private static final Color ROW_ALT      = new Color(248, 247, 255);
    private static final Color WHITE        = Color.WHITE;

    private static final DateTimeFormatter ISSUED_FMT =
            DateTimeFormatter.ofPattern("MMMM d, yyyy 'at' HH:mm 'UTC'");
    private static final DateTimeFormatter SHORT_FMT =
            DateTimeFormatter.ofPattern("MMM d, yyyy");

    private ReceiptPdfGenerator() {}

    public static byte[] generate(
            User user, OrderDto order,
            BigDecimal subtotal, BigDecimal shipping,
            BigDecimal discount, BigDecimal paidTotal,
            String paymentIntentId, String paymentMethod) {

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 50, 50, 50, 50);
            PdfWriter.getInstance(doc, out);
            doc.open();
            addContent(doc, user, order, subtotal, shipping, discount, paidTotal, paymentIntentId, paymentMethod);
            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("PDF generation failed for order {}: {}", order.id(), e.getMessage(), e);
            throw new RuntimeException("Failed to generate receipt PDF", e);
        }
    }

    private static void addContent(Document doc, User user, OrderDto order,
                                   BigDecimal subtotal, BigDecimal shipping,
                                   BigDecimal discount, BigDecimal paidTotal,
                                   String paymentIntentId, String paymentMethod) throws DocumentException {

        String shortId = order.id().length() >= 8 ? order.id().substring(0, 8).toUpperCase() : order.id();

        // ── Brand header ────────────────────────────────────────────────────
        Font brandFont   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, ACCENT);
        Font subFont     = FontFactory.getFont(FontFactory.HELVETICA, 10, MUTED);

        Paragraph brand = new Paragraph("SELLSIGHT", brandFont);
        brand.setSpacingAfter(4);
        doc.add(brand);

        Paragraph issued = new Paragraph(
                "Official Receipt · Issued " + ISSUED_FMT.format(LocalDateTime.now()), subFont);
        issued.setSpacingAfter(14);
        doc.add(issued);

        doc.add(new Chunk(new LineSeparator(2, 100, ACCENT, Element.ALIGN_LEFT, -2)));
        doc.add(Chunk.NEWLINE);

        // ── Order meta boxes ────────────────────────────────────────────────
        PdfPTable meta = new PdfPTable(4);
        meta.setWidthPercentage(100);
        meta.setSpacingBefore(14);
        meta.setSpacingAfter(16);
        meta.setWidths(new float[]{1f, 1f, 1.6f, 1.4f});

        addMetaCell(meta, "ORDER ID", "#" + shortId);
        addMetaCell(meta, "STATUS",   order.status());
        addMetaCell(meta, "PAYMENT",  paymentMethod);
        addMetaCell(meta, "DATE",     order.createdAt() != null ? SHORT_FMT.format(order.createdAt()) : "—");
        doc.add(meta);

        // ── Customer info ───────────────────────────────────────────────────
        if (user != null) {
            Font custLbl = FontFactory.getFont(FontFactory.HELVETICA, 8, MUTED);
            Font custVal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, DARK);

            PdfPTable custBox = new PdfPTable(1);
            custBox.setWidthPercentage(100);
            custBox.setSpacingAfter(18);

            PdfPCell cell = new PdfPCell();
            cell.setBackgroundColor(ACCENT_SOFT);
            cell.setBorderColor(BORDER_CLR);
            cell.setPadding(10);
            cell.addElement(new Paragraph("CUSTOMER", custLbl));
            cell.addElement(new Paragraph(
                    user.getFirstName() + " " + user.getLastName()
                    + "   ·   " + user.getEmail().getValue(), custVal));
            custBox.addCell(cell);
            doc.add(custBox);
        }

        // ── Items table ─────────────────────────────────────────────────────
        Font hdrFont  = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 8, WHITE);
        Font cellFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(55, 65, 81));
        Font boldCell = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, DARK);

        PdfPTable items = new PdfPTable(4);
        items.setWidthPercentage(100);
        items.setWidths(new float[]{3f, 0.8f, 1.2f, 1.2f});
        items.setSpacingAfter(0);

        for (String h : new String[]{"ITEM", "QTY", "UNIT PRICE", "SUBTOTAL"}) {
            PdfPCell hc = new PdfPCell(new Phrase(h, hdrFont));
            hc.setBackgroundColor(ACCENT);
            hc.setPadding(8);
            hc.setBorder(Rectangle.NO_BORDER);
            hc.setHorizontalAlignment("ITEM".equals(h) ? Element.ALIGN_LEFT : Element.ALIGN_RIGHT);
            items.addCell(hc);
        }

        boolean alt = false;
        for (OrderItemDto item : order.items()) {
            Color bg = alt ? ROW_ALT : WHITE;
            items.addCell(styledCell(item.productName(), cellFont, bg, Element.ALIGN_LEFT));
            items.addCell(styledCell(String.valueOf(item.quantity()), cellFont, bg, Element.ALIGN_RIGHT));
            items.addCell(styledCell(fmt(item.unitPrice()), cellFont, bg, Element.ALIGN_RIGHT));
            items.addCell(styledCell(fmt(item.subtotal()), boldCell, bg, Element.ALIGN_RIGHT));
            alt = !alt;
        }
        doc.add(items);

        // ── Totals ──────────────────────────────────────────────────────────
        Font totLbl   = FontFactory.getFont(FontFactory.HELVETICA, 10, MUTED);
        Font totVal   = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, DARK);
        Font grandLbl = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(76, 29, 149));
        Font grandVal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, ACCENT);

        PdfPTable totals = new PdfPTable(2);
        totals.setWidthPercentage(42);
        totals.setHorizontalAlignment(Element.ALIGN_RIGHT);
        totals.setSpacingBefore(16);

        addTotalsRow(totals, "Items subtotal",  fmt(subtotal),          totLbl, totVal,   false);
        addTotalsRow(totals, "Shipping",        fmt(shipping),          totLbl, totVal,   false);
        if (discount.compareTo(BigDecimal.ZERO) > 0) {
            addTotalsRow(totals, "Discounts", "-" + fmt(discount),      totLbl, totVal,   false);
        }
        addTotalsRow(totals, "Total paid",      fmt(paidTotal),         grandLbl, grandVal, true);
        doc.add(totals);

        // ── Payment reference ────────────────────────────────────────────────
        if (paymentIntentId != null && !paymentIntentId.isBlank() && !"free-order".equals(paymentIntentId)) {
            Font piFont = FontFactory.getFont(FontFactory.HELVETICA, 8, MUTED);
            Paragraph piP = new Paragraph("Payment reference: " + paymentIntentId, piFont);
            piP.setAlignment(Element.ALIGN_RIGHT);
            piP.setSpacingBefore(10);
            doc.add(piP);
        }

        // ── Footer ───────────────────────────────────────────────────────────
        doc.add(Chunk.NEWLINE);
        doc.add(new Chunk(new LineSeparator(1, 100, BORDER_CLR, Element.ALIGN_LEFT, -2)));
        Font footerFont = FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(156, 163, 175));
        Paragraph footer = new Paragraph(
                "SellSight · This receipt was generated automatically. For support, contact us through your account.",
                footerFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(8);
        doc.add(footer);
    }

    private static void addMetaCell(PdfPTable table, String label, String value) {
        Font lbl = FontFactory.getFont(FontFactory.HELVETICA, 8, MUTED);
        Font val = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, DARK);
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(ACCENT_SOFT);
        cell.setBorderColor(BORDER_CLR);
        cell.setPadding(10);
        cell.addElement(new Paragraph(label, lbl));
        cell.addElement(new Paragraph(value, val));
        table.addCell(cell);
    }

    private static PdfPCell styledCell(String text, Font font, Color bg, int align) {
        PdfPCell c = new PdfPCell(new Phrase(text, font));
        c.setPadding(8);
        c.setBorderColor(BORDER_CLR);
        c.setBackgroundColor(bg);
        c.setHorizontalAlignment(align);
        return c;
    }

    private static void addTotalsRow(PdfPTable table, String label, String value,
                                     Font labelFont, Font valueFont, boolean grand) {
        Color bg     = grand ? ACCENT_SOFT : WHITE;
        int border   = grand ? Rectangle.TOP : Rectangle.BOTTOM;
        Color border_ = grand ? ACCENT : BORDER_CLR;

        PdfPCell lc = new PdfPCell(new Phrase(label, labelFont));
        PdfPCell vc = new PdfPCell(new Phrase(value, valueFont));
        for (PdfPCell c : new PdfPCell[]{lc, vc}) {
            c.setBackgroundColor(bg);
            c.setPaddingTop(grand ? 10 : 5);
            c.setPaddingBottom(grand ? 10 : 5);
            c.setPaddingLeft(8);
            c.setPaddingRight(8);
            c.setBorder(border);
            c.setBorderColor(border_);
        }
        vc.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(lc);
        table.addCell(vc);
    }

    private static String fmt(BigDecimal v) {
        return NumberFormat.getCurrencyInstance(Locale.US)
                .format((v == null ? BigDecimal.ZERO : v).setScale(2, RoundingMode.HALF_UP));
    }

    private static String fmt(double v) {
        return fmt(BigDecimal.valueOf(v));
    }
}
