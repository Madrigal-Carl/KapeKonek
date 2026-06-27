export const verifyEmailTemplate = ({ verifyUrl }) => `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h1>Verify Your Email</h1>

    <p>Please confirm your email by clicking the button below:</p>

    <a href="${verifyUrl}" 
       style="display:inline-block;padding:10px 15px;background:#E63946;color:white;text-decoration:none;border-radius:5px;">
      Verify Email
    </a>

    <p style="margin-top:20px;color:gray;font-size:12px;">
      This link will expire in 15 minutes.
    </p>
  </div>
`;
