export function generateManagerEmailHTML(params: {
  email: string;
  username: string;
  password: string;
  tournamentName: string;
}) {
  const { email, username, password, tournamentName } = params;

  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 24px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 24px; border: 1px solid #e5e7eb;">
      
      <h2 style="color: #16a34a; margin-bottom: 8px;">
        Tournament Manager Assignment
      </h2>

      <p>Hello <strong>${username}</strong>,</p>

      <p>
        You have been assigned as a <strong>Tournament Manager</strong> for the tournament:
      </p>

      <p style="font-size: 16px; font-weight: bold; color: #111827;">
        ${tournamentName}
      </p>

      <hr style="margin: 20px 0;" />

      <h3>Your Login Credentials</h3>

      <div style="background-color: #f3f4f6; padding: 12px; border-radius: 6px;">
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Temporary Password:</strong> ${password}</p>
      </div>

      <p style="margin-top: 16px; color: #dc2626;">
        ⚠️ Please change your password immediately after your first login.
      </p>

      <p>
        If you face any issues accessing your account, contact the system administrator.
      </p>

      <hr style="margin: 24px 0;" />

      <p style="font-size: 12px; color: #6b7280;">
        © 2025–2026 UniLeague Hub. All rights reserved.
      </p>
    </div>
  </div>
  `;
}
export interface ManagerCredentials {
  email: string;
  username: string;
  temporaryPassword: string;
}
