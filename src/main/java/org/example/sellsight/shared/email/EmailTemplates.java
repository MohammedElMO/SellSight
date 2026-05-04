package org.example.sellsight.shared.email;

public final class EmailTemplates {

    private EmailTemplates() {
    }

    // ─── Branded email shell ───────────────────────────────────────────────────

    public static String action(String preheader,
                                String eyebrow,
                                String title,
                                String introHtml,
                                String ctaLabel,
                                String ctaUrl,
                                String noteHtml) {
        String button = ctaUrl == null || ctaUrl.isBlank()
                ? ""
                : """
                  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 24px">
                    <tr>
                      <td style="border-radius:999px;background:#0f766e;box-shadow:0 12px 30px rgba(15,118,110,.28)">
                        <a href="%s" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:800;text-decoration:none;letter-spacing:.01em">
                          %s &rarr;
                        </a>
                      </td>
                    </tr>
                  </table>
                  """.formatted(escapeAttribute(ctaUrl), escape(ctaLabel));

        String note = noteHtml == null || noteHtml.isBlank()
                ? ""
                : """
                  <div style="margin-top:20px;padding:14px 18px;border-radius:14px;background:#f0fdf9;border:1px solid #99f6e4;color:#134e4a;font-size:13px;line-height:1.6">
                    %s
                  </div>
                  """.formatted(noteHtml);

        return shell(preheader, eyebrow, title, introHtml + button + note);
    }

    public static String shell(String preheader, String eyebrow, String title, String bodyHtml) {
        return """
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <meta name="color-scheme" content="light">
                  <title>%s</title>
                </head>
                <body style="margin:0;padding:0;background:#f0faf7;color:#0f1a18;font-family:'Trebuchet MS',Verdana,Arial,sans-serif">
                  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">%s</div>
                  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background:linear-gradient(160deg,#e0f7f1 0%%,#f0faf7 40%%,#fafffe 100%%);padding:36px 12px">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:660px;border-collapse:separate;border-spacing:0">
                          <!-- Logo -->
                          <tr>
                            <td style="padding:0 0 16px;text-align:center">
                              <span style="color:#0f766e;font-weight:900;font-size:20px;letter-spacing:.06em;text-transform:uppercase">SellSight</span>
                            </td>
                          </tr>
                          <!-- Card -->
                          <tr>
                            <td style="border-radius:28px;overflow:hidden;background:#ffffff;box-shadow:0 20px 64px rgba(15,23,42,.12);border:1px solid rgba(15,118,110,.12)">
                              <!-- Card header -->
                              <div style="padding:32px 36px 28px;background:linear-gradient(135deg,#0b3d36 0%%,#0f766e 55%%,#10b09a 100%%);color:#ffffff">
                                <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.18);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;margin-bottom:14px">
                                  %s
                                </div>
                                <h1 style="margin:0;font-size:32px;line-height:1.1;letter-spacing:-.03em;font-weight:900">%s</h1>
                              </div>
                              <!-- Card body -->
                              <div style="padding:32px 36px 36px;background:#ffffff">%s</div>
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="padding:20px 8px 0;text-align:center;color:#6b7280;font-size:12px;line-height:1.6">
                              Transactional email from SellSight &mdash; reply for support.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(
                escape(title), escape(preheader),
                escape(eyebrow), escape(title),
                bodyHtml
        );
    }

    // ─── Receipt attachment shell (print-friendly) ─────────────────────────────

    /**
     * Wraps a receipt body in a clean, print-friendly HTML document that
     * matches the SellSight brand palette.
     */
    public static String receiptShell(String title, String bodyHtml) {
        return """
                <!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8" />
                  <meta name="viewport" content="width=device-width, initial-scale=1" />
                  <title>%s</title>
                  <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { background: #f0faf7; color: #0f1a18; font-family: Arial, Helvetica, sans-serif; font-size: 14px; }
                    .page { max-width: 720px; margin: 28px auto; background: #fff; border: 1px solid #d1fae5; border-radius: 16px; overflow: hidden; }
                    .hdr { padding: 24px 28px; background: linear-gradient(135deg, #0b3d36 0%%, #0f766e 55%%, #10b09a 100%%); color: #fff; }
                    .hdr h1 { font-size: 22px; font-weight: 900; margin-bottom: 4px; }
                    .hdr p { font-size: 13px; opacity: .85; }
                    .body { padding: 24px 28px; }
                    .meta { display: flex; flex-wrap: wrap; gap: 8px 32px; margin-bottom: 20px; }
                    .meta-item { font-size: 13px; color: #374151; }
                    .meta-item strong { color: #0f1a18; }
                    table { width: 100%%; border-collapse: collapse; margin-bottom: 20px; }
                    thead { background: #f0fdf9; }
                    th { padding: 10px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: .06em; color: #0f766e; border-bottom: 2px solid #d1fae5; }
                    td { padding: 10px 12px; border-bottom: 1px solid #f0faf7; font-size: 13px; color: #374151; }
                    tr:last-child td { border-bottom: none; }
                    .totals td { padding: 6px 12px; border: none; }
                    .totals .label { color: #6b7280; }
                    .totals .grand td { font-size: 16px; font-weight: 900; color: #0f766e; padding-top: 14px; border-top: 2px solid #d1fae5; }
                    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; background: #d1fae5; color: #065f46; }
                    @media print { body { background: white; } .page { border: none; border-radius: 0; margin: 0; } }
                  </style>
                </head>
                <body>
                  <div class="page">
                    %s
                  </div>
                </body>
                </html>
                """.formatted(escape(title), bodyHtml);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    public static String paragraph(String value) {
        return "<p style=\"margin:0 0 16px;color:#374151;font-size:15px;line-height:1.75\">" + value + "</p>";
    }

    public static String muted(String value) {
        return "<p style=\"margin:0;color:#6b7280;font-size:13px;line-height:1.6\">" + value + "</p>";
    }

    public static String highlight(String value) {
        return "<span style=\"color:#0f766e;font-weight:700\">" + escape(value) + "</span>";
    }

    public static String escape(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }

    private static String escapeAttribute(String value) {
        return escape(value).replace("`", "&#96;");
    }
}
