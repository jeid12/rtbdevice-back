import nodemailer from 'nodemailer';
import { Device } from '../entity/Device';
import { School } from '../entity/School';
import { Application } from '../entity/Application';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: 'RTB Assets Management - OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #006633; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #ffffff; margin: 0;">RTB Assets Management</h2>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px;">
              You recently attempted to sign in to <strong>RTB Assets Management</strong>. Please use the following One-Time Password (OTP) to complete your login:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="display: inline-block; padding: 14px 28px; font-size: 22px; background-color: #FFD700; color: #000; font-weight: bold; border-radius: 8px; letter-spacing: 2px;">
                ${otp}
              </span>
            </div>
            <p style="font-size: 16px;">
              If you did not request this code, you can safely ignore this email.
            </p>
            <p style="font-size: 16px;">Kind regards,<br><strong>RTB ICT Department</strong></p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            © ${new Date().getFullYear()} Rwanda TVET Board – All rights reserved.
          </div>
        </div>
      </div>
    `,
  });
};

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Send maintenance reminder emails
 */
export const sendMaintenanceReminder = async (devices: Device[], recipients: string[]): Promise<void> => {
  const template = generateMaintenanceReminderTemplate(devices);
  
  for (const recipient of recipients) {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipient,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }
};

/**
 * Send warranty expiry alerts
 */
export const sendWarrantyExpiryAlert = async (devices: Device[], recipients: string[]): Promise<void> => {
  const template = generateWarrantyExpiryTemplate(devices);
  
  for (const recipient of recipients) {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipient,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }
};

/**
 * Send offline device notifications
 */
export const sendOfflineDeviceAlert = async (devices: Device[], recipients: string[]): Promise<void> => {
  const template = generateOfflineDeviceTemplate(devices);
  
  for (const recipient of recipients) {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipient,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }
};

/**
 * Send device assignment notifications
 */
export const sendDeviceAssignmentNotification = async (device: Device, school: School, recipients: string[]): Promise<void> => {
  const template = generateDeviceAssignmentTemplate(device, school);
  
  for (const recipient of recipients) {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipient,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }
};

/**
 * Send automation report
 */
export const sendAutomationReport = async (reportData: any, recipients: string[]): Promise<void> => {
  const template = generateAutomationReportTemplate(reportData);
  
  for (const recipient of recipients) {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: recipient,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  }
};

/**
 * Generate maintenance reminder template
 */
const generateMaintenanceReminderTemplate = (devices: Device[]): EmailTemplate => {
  const deviceList = devices.map(d => 
    `- ${d.name_tag} (${d.model}) at ${d.school?.name || 'Unassigned'}`
  ).join('\n');

  return {
    subject: `Maintenance Reminder - ${devices.length} Device(s) Need Attention`,
    text: `Dear Team,

The following devices are due for maintenance:

${deviceList}

Please schedule maintenance as soon as possible to ensure optimal performance.

Best regards,
RTB Device Management System`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #ff6b35; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #ffffff; margin: 0;">Maintenance Reminder</h2>
          </div>
          <div style="padding: 30px;">
            <p>Dear Team,</p>
            <p>The following devices are due for maintenance:</p>
            <ul>
              ${devices.map(d => `
                <li><strong>${d.name_tag}</strong> (${d.model}) at ${d.school?.name || 'Unassigned'}</li>
              `).join('')}
            </ul>
            <p>Please schedule maintenance as soon as possible to ensure optimal performance.</p>
            <p>Best regards,<br><strong>RTB Device Management System</strong></p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            © ${new Date().getFullYear()} Rwanda TVET Board – All rights reserved.
          </div>
        </div>
      </div>
    `
  };
};

/**
 * Generate warranty expiry template
 */
const generateWarrantyExpiryTemplate = (devices: Device[]): EmailTemplate => {
  const deviceList = devices.map(d => 
    `- ${d.name_tag} (${d.model}) - Expires: ${d.warrantyExpiry?.toLocaleDateString()}`
  ).join('\n');

  return {
    subject: `Warranty Expiry Alert - ${devices.length} Device(s)`,
    text: `Dear Team,

The following devices have warranties expiring soon:

${deviceList}

Please consider extending warranties or planning for replacements.

Best regards,
RTB Device Management System`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #ffa500; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #ffffff; margin: 0;">Warranty Expiry Alert</h2>
          </div>
          <div style="padding: 30px;">
            <p>Dear Team,</p>
            <p>The following devices have warranties expiring soon:</p>
            <ul>
              ${devices.map(d => `
                <li><strong>${d.name_tag}</strong> (${d.model}) - Expires: ${d.warrantyExpiry?.toLocaleDateString()}</li>
              `).join('')}
            </ul>
            <p>Please consider extending warranties or planning for replacements.</p>
            <p>Best regards,<br><strong>RTB Device Management System</strong></p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            © ${new Date().getFullYear()} Rwanda TVET Board – All rights reserved.
          </div>
        </div>
      </div>
    `
  };
};

/**
 * Generate offline device template
 */
const generateOfflineDeviceTemplate = (devices: Device[]): EmailTemplate => {
  const deviceList = devices.map(d => 
    `- ${d.name_tag} (${d.model}) - Last seen: ${d.lastSeenAt?.toLocaleDateString()}`
  ).join('\n');

  return {
    subject: `Offline Device Alert - ${devices.length} Device(s)`,
    text: `Dear Team,

The following devices have been offline for an extended period:

${deviceList}

Please check these devices to ensure they are functioning properly.

Best regards,
RTB Device Management System`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #dc3545; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #ffffff; margin: 0;">Offline Device Alert</h2>
          </div>
          <div style="padding: 30px;">
            <p>Dear Team,</p>
            <p>The following devices have been offline for an extended period:</p>
            <ul>
              ${devices.map(d => `
                <li><strong>${d.name_tag}</strong> (${d.model}) - Last seen: ${d.lastSeenAt?.toLocaleDateString()}</li>
              `).join('')}
            </ul>
            <p>Please check these devices to ensure they are functioning properly.</p>
            <p>Best regards,<br><strong>RTB Device Management System</strong></p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            © ${new Date().getFullYear()} Rwanda TVET Board – All rights reserved.
          </div>
        </div>
      </div>
    `
  };
};

/**
 * Generate device assignment template
 */
const generateDeviceAssignmentTemplate = (device: Device, school: School): EmailTemplate => {
  return {
    subject: `Device Assignment - ${device.name_tag} assigned to ${school.name}`,
    text: `Dear Team,

Device ${device.name_tag} (${device.model}) has been assigned to ${school.name}.

School Details:
- Name: ${school.name}
- Code: ${school.code}
- Location: ${school.fullAddress}

Device Details:
- Model: ${device.model}
- Brand: ${device.brand}
- Serial Number: ${device.serialNumber}

Best regards,
RTB Device Management System`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #28a745; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #ffffff; margin: 0;">Device Assignment Notification</h2>
          </div>
          <div style="padding: 30px;">
            <p>Dear Team,</p>
            <p>Device <strong>${device.name_tag}</strong> (${device.model}) has been assigned to <strong>${school.name}</strong>.</p>
            
            <h3>School Details:</h3>
            <ul>
              <li><strong>Name:</strong> ${school.name}</li>
              <li><strong>Code:</strong> ${school.code}</li>
              <li><strong>Location:</strong> ${school.fullAddress}</li>
            </ul>
            
            <h3>Device Details:</h3>
            <ul>
              <li><strong>Model:</strong> ${device.model}</li>
              <li><strong>Brand:</strong> ${device.brand}</li>
              <li><strong>Serial Number:</strong> ${device.serialNumber}</li>
            </ul>
            
            <p>Best regards,<br><strong>RTB Device Management System</strong></p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            © ${new Date().getFullYear()} Rwanda TVET Board – All rights reserved.
          </div>
        </div>
      </div>
    `
  };
};

/**
 * Generate automation report template
 */
const generateAutomationReportTemplate = (reportData: any): EmailTemplate => {
  return {
    subject: `Automation Report - ${new Date().toLocaleDateString()}`,
    text: `Dear Team,

Automation Report for ${new Date().toLocaleDateString()}:

- Total Rules Executed: ${reportData.totalRulesExecuted}
- Successful Executions: ${reportData.successfulExecutions}
- Failed Executions: ${reportData.failedExecutions}
- Devices Processed: ${reportData.devicesProcessed}
- Notifications Sent: ${reportData.notificationsSent}
- Maintenance Scheduled: ${reportData.maintenanceScheduled}
- Automation Efficiency: ${reportData.automationEfficiency}%

Best regards,
RTB Device Management System`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #007bff; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #ffffff; margin: 0;">Automation Report - ${new Date().toLocaleDateString()}</h2>
          </div>
          <div style="padding: 30px;">
            <p>Dear Team,</p>
            
            <table border="1" cellpadding="10" cellspacing="0" style="width: 100%; border-collapse: collapse;">
              <tr><td><strong>Total Rules Executed</strong></td><td>${reportData.totalRulesExecuted}</td></tr>
              <tr><td><strong>Successful Executions</strong></td><td>${reportData.successfulExecutions}</td></tr>
              <tr><td><strong>Failed Executions</strong></td><td>${reportData.failedExecutions}</td></tr>
              <tr><td><strong>Devices Processed</strong></td><td>${reportData.devicesProcessed}</td></tr>
              <tr><td><strong>Notifications Sent</strong></td><td>${reportData.notificationsSent}</td></tr>
              <tr><td><strong>Maintenance Scheduled</strong></td><td>${reportData.maintenanceScheduled}</td></tr>
              <tr><td><strong>Automation Efficiency</strong></td><td>${reportData.automationEfficiency}%</td></tr>
            </table>
            
            <p>Best regards,<br><strong>RTB Device Management System</strong></p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            © ${new Date().getFullYear()} Rwanda TVET Board – All rights reserved.
          </div>
        </div>
      </div>
    `
  };
};

export const sendNewApplicationNotification = async (application: Application): Promise<void> => {
  const recipients = [process.env.ADMIN_EMAIL].filter((email): email is string => !!email);
  if (recipients.length === 0) return;

  const subject = `New ${application.type === 'new_device_request' ? 'Device Request' : 'Maintenance Request'} - ${application.title}`;
  
  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: recipients,
    subject,
    text: `
A new application has been submitted:

Type: ${application.type === 'new_device_request' ? 'New Device Request' : 'Maintenance Request'}
Title: ${application.title}
School: ${application.school.name}
Priority: ${application.priority}
Description: ${application.description}

${application.isNewDeviceRequest ? `
Requested Device Count: ${application.requestedDeviceCount}
Requested Device Type: ${application.requestedDeviceType}
Justification: ${application.justification}
` : `
Affected Devices: ${application.affectedDeviceCount}
`}

Please review and take appropriate action.

Best regards,
RTB Device Management System`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #007bff; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #ffffff; margin: 0;">New Application Submitted</h2>
          </div>
          <div style="padding: 30px;">
            <p><strong>A new application has been submitted:</strong></p>
            
            <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td><strong>Type</strong></td><td>${application.type === 'new_device_request' ? 'New Device Request' : 'Maintenance Request'}</td></tr>
              <tr><td><strong>Title</strong></td><td>${application.title}</td></tr>
              <tr><td><strong>School</strong></td><td>${application.school.name}</td></tr>
              <tr><td><strong>Priority</strong></td><td>${application.priorityDisplayName}</td></tr>
              <tr><td><strong>Submitted</strong></td><td>${application.createdAt.toLocaleDateString()}</td></tr>
            </table>

            <p><strong>Description:</strong></p>
            <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #007bff;">${application.description}</p>

            ${application.isNewDeviceRequest ? `
            <p><strong>Device Request Details:</strong></p>
            <ul>
              <li>Requested Count: ${application.requestedDeviceCount}</li>
              <li>Device Type: ${application.requestedDeviceType}</li>
              <li>Application Letter: ${application.hasApplicationLetter ? 'Uploaded' : 'Not provided'}</li>
            </ul>
            <p><strong>Justification:</strong></p>
            <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #28a745;">${application.justification}</p>
            ` : `
            <p><strong>Maintenance Request Details:</strong></p>
            <p>Affected Devices: ${application.affectedDeviceCount}</p>
            `}
            
            <p>Please review and take appropriate action through the RTB Device Management System.</p>
            
            <p>Best regards,<br><strong>RTB Device Management System</strong></p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            © ${new Date().getFullYear()} Rwanda TVET Board – All rights reserved.
          </div>
        </div>
      </div>
    `
  });
};

export const sendMaintenanceRequestNotification = async (application: Application): Promise<void> => {
  const recipients = [process.env.ADMIN_EMAIL].filter((email): email is string => !!email);
  if (recipients.length === 0) return;

  const deviceList = application.deviceIssues.map(issue => 
    `- ${issue.device.name_tag} (${issue.device.model}): ${issue.problemDescription}`
  ).join('\n');

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: recipients,
    subject: `Maintenance Request - ${application.title}`,
    text: `
A new maintenance request has been submitted:

Title: ${application.title}
School: ${application.school.name}
Priority: ${application.priority}
Description: ${application.description}

Affected Devices:
${deviceList}

Please review and assign a technician.

Best regards,
RTB Device Management System`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: #ffc107; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #000; margin: 0;">Maintenance Request</h2>
          </div>
          <div style="padding: 30px;">
            <p><strong>A new maintenance request has been submitted:</strong></p>
            
            <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td><strong>Title</strong></td><td>${application.title}</td></tr>
              <tr><td><strong>School</strong></td><td>${application.school.name}</td></tr>
              <tr><td><strong>Priority</strong></td><td>${application.priorityDisplayName}</td></tr>
              <tr><td><strong>Submitted</strong></td><td>${application.createdAt.toLocaleDateString()}</td></tr>
              <tr><td><strong>Affected Devices</strong></td><td>${application.affectedDeviceCount}</td></tr>
            </table>

            <p><strong>Description:</strong></p>
            <p style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #ffc107;">${application.description}</p>

            <p><strong>Device Issues:</strong></p>
            <ul>
              ${application.deviceIssues.map(issue => 
                `<li><strong>${issue.device.name_tag}</strong> (${issue.device.model}): ${issue.problemDescription}</li>`
              ).join('')}
            </ul>
            
            <p>Please review and assign a technician through the RTB Device Management System.</p>
            
            <p>Best regards,<br><strong>RTB Device Management System</strong></p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            © ${new Date().getFullYear()} Rwanda TVET Board – All rights reserved.
          </div>
        </div>
      </div>
    `
  });
};

export const sendApplicationStatusChangeNotification = async (application: Application, previousStatus: string): Promise<void> => {
  if (!application.school.user?.email) return;

  const statusColor: Record<string, string> = {
    approved: '#28a745',
    rejected: '#dc3545',
    in_progress: '#007bff',
    completed: '#28a745',
    pending: '#6c757d',
    under_review: '#17a2b8',
    cancelled: '#6c757d'
  };
  
  const color = statusColor[application.status] || '#6c757d';

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to: application.school.user.email,
    subject: `Application Status Update - ${application.title}`,
    text: `
Dear ${application.school.user.fullName},

Your application "${application.title}" status has been updated:

Previous Status: ${previousStatus}
New Status: ${application.status}

${application.status === 'approved' ? `
Estimated Cost: ${application.estimatedCost ? `${application.estimatedCost} RWF` : 'To be determined'}
Estimated Completion: ${application.estimatedCompletionDate ? application.estimatedCompletionDate.toLocaleDateString() : 'To be determined'}
` : ''}

${application.status === 'rejected' ? `
Rejection Reason: ${application.rejectionReason}
` : ''}

${application.adminNotes ? `
Admin Notes: ${application.adminNotes}
` : ''}

Best regards,
RTB Device Management System`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="background-color: ${color}; padding: 20px; border-top-left-radius: 8px; border-top-right-radius: 8px;">
            <h2 style="color: #ffffff; margin: 0;">Application Status Update</h2>
          </div>
          <div style="padding: 30px;">
            <p>Dear <strong>${application.school.user.fullName}</strong>,</p>
            
            <p>Your application "<strong>${application.title}</strong>" status has been updated:</p>
            
            <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr><td><strong>Previous Status</strong></td><td>${previousStatus}</td></tr>
              <tr><td><strong>New Status</strong></td><td style="color: ${color}; font-weight: bold;">${application.statusDisplayName}</td></tr>
              ${application.estimatedCost ? `<tr><td><strong>Estimated Cost</strong></td><td>${application.estimatedCost} RWF</td></tr>` : ''}
              ${application.estimatedCompletionDate ? `<tr><td><strong>Estimated Completion</strong></td><td>${application.estimatedCompletionDate.toLocaleDateString()}</td></tr>` : ''}
            </table>

            ${application.rejectionReason ? `
            <p><strong>Rejection Reason:</strong></p>
            <p style="background-color: #f8d7da; padding: 15px; border-left: 4px solid #dc3545;">${application.rejectionReason}</p>
            ` : ''}

            ${application.adminNotes ? `
            <p><strong>Admin Notes:</strong></p>
            <p style="background-color: #d1ecf1; padding: 15px; border-left: 4px solid #17a2b8;">${application.adminNotes}</p>
            ` : ''}
            
            <p>You can track your application progress through the RTB Device Management System.</p>
            
            <p>Best regards,<br><strong>RTB Device Management System</strong></p>
          </div>
          <div style="background-color: #f1f1f1; text-align: center; padding: 15px; font-size: 12px; color: #777; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
            © ${new Date().getFullYear()} Rwanda TVET Board – All rights reserved.
          </div>
        </div>
      </div>
    `
  });
};


