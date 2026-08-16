export const verifyEmailTemplate = ({ verifyUrl }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Email</title>
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
                Verify Your Email
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 32px;">
              <p style="font-size:16px;color:#251712;margin-top:0;">
                Welcome to KapeKonek,
              </p>

              <p style="font-size:16px;line-height:1.7;color:#6A5952;">
                Thanks for signing up. Click the button below to verify your
                email address and activate your account.
              </p>

              <div style="text-align:center;margin:32px 0;">
                <a
                  href="${verifyUrl}"
                  style="
                    display:inline-block;
                    background:#9E4421;
                    color:#F9F4EE;
                    padding:14px 28px;
                    text-decoration:none;
                    font-weight:600;
                    border-radius:6px;
                  "
                >
                  Verify Email
                </a>
              </div>

              <p style="font-size:14px;color:#6A5952;">
                If the button doesn't work, copy and paste this link into
                your browser:
              </p>
              <p
                style="
                  word-break:break-all;
                  color:#9E4421;
                  font-size:13px;
                "
              >
                ${verifyUrl}
              </p>

              <p style="font-size:14px;line-height:1.7;color:#6A5952;">
                If you didn't create this account, you can safely ignore this
                email.
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
              KapeKonek · Connecting coffee farmers and buyers
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
