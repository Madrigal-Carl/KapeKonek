export const verifyEmailTemplate = ({ verifyUrl }) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
    <h2>Verify your email</h2>
    <p>Thanks for signing up for KapeKonek. Click the button below to verify your email address and activate your account.</p>
    <p style="margin: 24px 0;">
      <a href="${verifyUrl}" style="background: #1a1a1a; color: #fff; padding: 12px 24px; text-decoration: none; display: inline-block;">
        Verify Email
      </a>
    </p>
    <p>If the button doesn't work, copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #555;">${verifyUrl}</p>
    <p>If you didn't create this account, you can safely ignore this email.</p>
  </div>
`;
