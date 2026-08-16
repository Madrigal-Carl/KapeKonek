export const associationApprovedTemplate = ({ name, association }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Association Approved</title>
</head>
<body style="margin:0;padding:0;background-color:#F1EAE0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table
          width="600"
          cellpadding="0"
          cellspacing="0"
          style="
            background:#F9F4EE;
            border:1px solid #E4D4C7;
            border-radius:12px;
            overflow:hidden;
            box-shadow:0 4px 20px rgba(37,23,18,0.08);
          "
        >
          <tr>
            <td
              style="
                background:#251712;
                padding:32px;
                text-align:center;
              "
            >
              <h1 style="margin:0;font-size:20px;color:#F1EAE0;letter-spacing:0.04em;">
                KAPEKONEK
              </h1>
              <p style="margin:8px 0 0;font-size:14px;color:#E4D4C7;">
                Association Application Approved
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 32px;">
              <p style="font-size:16px;color:#251712;margin-top:0;">
                Hi ${name || "there"},
              </p>

              <p style="font-size:16px;line-height:1.7;color:#6A5952;">
                We're pleased to inform you that your application to join
                ${association || "your association"} has been approved by
                the manager.
              </p>

              <p style="font-size:16px;line-height:1.7;color:#6A5952;">
                Your registration for KapeKonek is now fully verified. You
                can start registering farms, tracking harvests, and using
                all the features available on the platform.
              </p>

              <div style="text-align:center;margin:32px 0;">
                <span
                  style="
                    display:inline-block;
                    background:#9E4421;
                    color:#F9F4EE;
                    padding:12px 20px;
                    border-radius:999px;
                    font-weight:600;
                  "
                >
                  ✓ Association Verified
                </span>
              </div>

              <p style="font-size:14px;line-height:1.7;color:#6A5952;">
                If you did not request this, please contact our support team
                immediately.
              </p>

              <p style="font-size:16px;color:#251712;margin-bottom:0;">
                Thank you,<br />
                <strong>KapeKonek Team</strong>
              </p>
            </td>
          </tr>

          <tr>
            <td
              style="
                background:#F1EAE0;
                border-top:1px solid #E4D4C7;
                padding:20px;
                text-align:center;
                color:#6A5952;
                font-size:12px;
              "
            >
              This is an automated email. Please do not reply.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
