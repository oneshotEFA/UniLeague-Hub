"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateManagerEmailHTML = generateManagerEmailHTML;
exports.generateTeamAccessEmailHTML = generateTeamAccessEmailHTML;
function generateManagerEmailHTML(params) {
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
function generateTeamAccessEmailHTML(params) {
    const { recipientName, teamName, tournamentName, registrationKey, accessKey, } = params;
    return `
  <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f9fafb; padding: 24px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; padding: 28px; border: 1px solid #e5e7eb;">

      <!-- Header -->
      <h2 style="color: #2563eb; margin-bottom: 6px;">
        Team Access Information
      </h2>
      <p style="color: #6b7280; margin-top: 0;">
        ${tournamentName}
      </p>

      <hr style="margin: 20px 0;" />

      <!-- Greeting -->
      <p>Hello <strong>${recipientName}</strong>,</p>

      <p>
        Your team <strong>${teamName}</strong> has been successfully registered
        for the tournament <strong>${tournamentName}</strong>.
      </p>

      <p>
        Below are the access keys required to manage registrations and team content.
        Please keep them secure.
      </p>

      <!-- Player Registration -->
      <div style="margin-top: 20px; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #111827;">
          🎮 Player Registration Key
        </h3>
        <p style="margin-bottom: 8px;">
          Players should use this key to register and join your team:
        </p>
        <p style="font-size: 16px; font-weight: bold; color: #16a34a;">
          ${registrationKey}
        </p>
      </div>

      <!-- Coach Access -->
      <div style="margin-top: 16px; padding: 16px; background-color: #f3f4f6; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #111827;">
          🏆 Coach Access Key
        </h3>
        <p style="margin-bottom: 8px;">
          The coach should use this key to:
        </p>
        <ul style="margin-top: 0; padding-left: 20px; color: #374151;">
          <li>Upload match images</li>
          <li>Post team-related content</li>
          <li>Manage team updates</li>
        </ul>
        <p style="font-size: 16px; font-weight: bold; color: #dc2626;">
          ${accessKey}
        </p>
      </div>

      <!-- Security Note -->
      <p style="margin-top: 20px; color: #b45309;">
        ⚠️ Do not share these keys publicly. Anyone with access can manage team data.
      </p>

      <p>
        If you experience any issues or believe these keys have been compromised,
        please contact the system administrator immediately.
      </p>

      <hr style="margin: 28px 0;" />

      <!-- Footer -->
      <p style="font-size: 12px; color: #6b7280;">
        © 2025–2026 UniLeague Hub. All rights reserved.
      </p>

    </div>
  </div>
  `;
}
