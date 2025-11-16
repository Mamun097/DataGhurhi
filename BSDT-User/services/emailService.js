// backend/services/emailService.js - Fixed version

// Try to load nodemailer
const nodemailer = require('nodemailer');

// Verify nodemailer loaded correctly
if (!nodemailer || typeof nodemailer.createTransport !== 'function') {
  console.error('❌ ERROR: nodemailer is not properly installed');
  console.error('Please run: npm install nodemailer');
  throw new Error('nodemailer not properly installed');
}

console.log('✅ Nodemailer loaded successfully');

// Configure your email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false // For development only
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter verification failed:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

/**
 * Send collaborator invitation email
 * @param {Object} params - Email parameters
 */
async function sendCollaboratorInvitation({
  invitorName,
  invitorEmail,
  collaboratorEmail,
  collaboratorName = null,
  projectTitle,
  projectField,
  projectDescription,
  accessRole,
  projectId,
}) {
  const collaborationLink = 'https://dataghurhi.cse.buet.ac.bd/dashboard?tab=shared';
  
  // Format access role for display
  const roleDisplay = accessRole.charAt(0).toUpperCase() + accessRole.slice(1);
  
  // Create email subject
  const subject = `You've been invited to collaborate on "${projectTitle}"`;
  
  // Create HTML email body
  const htmlBody = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #4bb77d, #046060);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 600;
        }
        .content {
          padding: 40px 30px;
        }
        .greeting {
          font-size: 18px;
          color: #1e293b;
          margin-bottom: 20px;
        }
        .message {
          font-size: 16px;
          color: #475569;
          margin-bottom: 30px;
          line-height: 1.8;
        }
        .project-details {
          background-color: #f8fafc;
          border-left: 4px solid #4bb77d;
          padding: 20px;
          margin: 30px 0;
          border-radius: 4px;
        }
        .project-details h2 {
          margin: 0 0 15px 0;
          font-size: 20px;
          color: #1e293b;
        }
        .detail-row {
          margin-bottom: 12px;
          font-size: 15px;
        }
        .detail-label {
          font-weight: 600;
          color: #475569;
        }
        .detail-value {
          color: #64748b;
        }
        .role-badge {
          display: inline-block;
          padding: 4px 12px;
          background-color: ${accessRole === 'editor' ? '#10b981' : '#3b82f6'};
          color: white;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
        }
        .cta-button {
          display: inline-block;
          padding: 14px 32px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 20px 0;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .footer {
          background-color: #f8fafc;
          padding: 30px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
          border-top: 1px solid #e2e8f0;
        }
        .link {
          color: #667eea;
          word-break: break-all;
        }
        .divider {
          height: 1px;
          background-color: #e2e8f0;
          margin: 30px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤝 Project Collaboration Invitation</h1>
        </div>
        
        <div class="content">
          <p class="greeting">Hello${collaboratorName ? ' ' + collaboratorName : ''},</p>
          
          <p class="message">
            <strong>${invitorName}</strong> (${invitorEmail}) has invited you to collaborate on their research project on the DataGhurhi platform.
          </p>
          
          <div class="project-details">
            <h2>📊 Project Details</h2>
            <div class="detail-row">
              <span class="detail-label">Project Name:</span>
              <span class="detail-value"><strong>${projectTitle}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Research Field:</span>
              <span class="detail-value">${projectField}</span>
            </div>
            ${projectDescription ? `
            <div class="detail-row">
              <span class="detail-label">Description:</span>
              <span class="detail-value">${projectDescription}</span>
            </div>
            ` : ''}
            <div class="detail-row">
              <span class="detail-label">Your Role:</span>
              <span class="detail-value">
                <span class="role-badge">${roleDisplay}</span>
              </span>
            </div>
          </div>
          
          <p class="message">
            ${accessRole === 'editor' 
              ? 'As an <strong>Editor</strong>, you will be able to view, create, edit, and manage surveys within this project.' 
              : 'As a <strong>Viewer</strong>, you will be able to view the project and its surveys, but will not be able to make changes.'}
          </p>
          
          <div class="button-container">
            <a href="${collaborationLink}" class="cta-button">
              View Collaboration Request
            </a>
          </div>
          
          <div class="divider"></div>
          
          <p class="message" style="font-size: 14px; color: #64748b;">
            If the button above doesn't work, copy and paste this link into your browser:<br>
            <a href="${collaborationLink}" class="link">${collaborationLink}</a>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>DataGhurhi Research Platform</strong></p>
          <p>Empowering research through collaborative data collection</p>
          <p style="margin-top: 15px; font-size: 12px;">
            If you received this email by mistake, please ignore it.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  // Create plain text version
  const textBody = `
Project Collaboration Invitation

Hello${collaboratorName ? ' ' + collaboratorName : ''},

${invitorName} (${invitorEmail}) has invited you to collaborate on their research project on the DataGhurhi platform.

PROJECT DETAILS:
- Project Name: ${projectTitle}
- Research Field: ${projectField}
${projectDescription ? `- Description: ${projectDescription}\n` : ''}- Your Role: ${roleDisplay}

${accessRole === 'editor' 
  ? 'As an Editor, you will be able to view, create, edit, and manage surveys within this project.' 
  : 'As a Viewer, you will be able to view the project and its surveys, but will not be able to make changes.'}

To view and respond to this collaboration request, please visit:
${collaborationLink}

---
DataGhurhi Research Platform

If you received this email by mistake, please ignore it.
  `;

  // Send email
  try {
    const info = await transporter.sendMail({
      from: `"DataGhurhi Platform" <${process.env.EMAIL_USER}>`,
      to: collaboratorEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    });

    console.log('✅ Collaborator invitation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending collaborator invitation email:', error);
    throw error;
  }
}

module.exports = {
  sendCollaboratorInvitation,
};