const fmt = (n) =>
  `\u20B1${Number(n).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const orderConfirmationTemplate = ({
  name,
  referenceNumber,
  items = [],
  totalPrice,
  deliveryMethod,
  noteDelivery = false,
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmation</title>
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
            <td style="background:#251712;padding:32px;text-align:center;">
              <h1 style="margin:0;font-size:20px;color:#F1EAE0;letter-spacing:0.04em;">
                KAPEKONEK
              </h1>
              <p style="margin:8px 0 0;font-size:14px;color:#E4D4C7;">
                Order Confirmation
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 32px;">
              <p style="font-size:16px;color:#251712;margin-top:0;">
                Hi ${name || "there"},
              </p>

              <p style="font-size:16px;line-height:1.7;color:#6A5952;">
                Thank you for your order! Your order has been received and is
                now being processed.
              </p>

              <div
                style="
                  margin:24px 0;
                  padding:16px 20px;
                  background:#F1EAE0;
                  border-radius:8px;
                "
              >
                <p style="margin:0 0 4px;font-size:13px;color:#6A5952;">
                  ORDER REFERENCE
                </p>
                <p style="margin:0;font-size:18px;font-weight:bold;color:#251712;">
                  ${referenceNumber}
                </p>
              </div>

              <p style="font-size:15px;font-weight:bold;color:#251712;margin:24px 0 8px;">
                Your Order
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr style="background:#E4D4C7;color:#251712;">
                  <td style="padding:10px 12px;font-size:13px;">Products</td>
                  <td style="padding:10px 12px;font-size:13px;text-align:right;">Qty</td>
                  <td style="padding:10px 12px;font-size:13px;text-align:right;">Price</td>
                </tr>
                ${items
                  .map(
                    (item) => `
                <tr style="border-bottom:1px solid #E4D4C7;">
                  <td style="padding:12px;font-size:14px;color:#251712;">${item.name || "Product"}</td>
                  <td style="padding:12px;font-size:14px;color:#6A5952;text-align:right;">${item.quantity}</td>
                  <td style="padding:12px;font-size:14px;color:#6A5952;text-align:right;">${fmt(
                    item.lineTotal,
                  )}</td>
                </tr>`,
                  )
                  .join("")}
                <tr>
                  <td colspan="2" style="padding:12px;font-size:14px;font-weight:bold;color:#251712;text-align:right;">
                    Total
                  </td>
                  <td style="padding:12px;font-size:15px;font-weight:bold;color:#251712;text-align:right;">
                    ${fmt(totalPrice)}
                  </td>
                </tr>
              </table>

              ${
                noteDelivery
                  ? `<p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6A5952;">
                    This order is for <strong style="color:#251712;">delivery</strong>. The
                    delivery fee is not included in the total above — it will be computed
                    and emailed to you separately once it has been finalized, before your
                    order is shipped.
                  </p>`
                  : `<p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#6A5952;">
                    This order is for <strong style="color:#251712;">pickup</strong>. We'll
                    let you know once your items are ready for collection.
                  </p>`
              }

              <p style="margin:24px 0 0;font-size:14px;color:#6A5952;">
                Thank you for supporting KapeKonek and its partner farmers and
                cooperatives.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:20px 32px;background:#251712;text-align:center;">
              <p style="margin:0;font-size:12px;color:#E4D4C7;">
                KapeKonek · Coffee, direct from farm.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
