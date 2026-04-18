/* 
  AIRLINK NEWSLETTER BACKEND v1.0
  --------------------------------------------------
  Handles newsletter subscriptions and logs them into a Google Sheet.
  Automates "Thank You" emails.
*/

const APP_NAME = "AirLink";
const SHEET_NAME = "AirLink_Newsletter_Subscribers";

function doGet(e) {
  return ContentService.createTextOutput("AirLink Newsletter Backend Active");
}

function doPost(e) {
  try {
    const email = e.parameter.email;
    const action = e.parameter.action;

    if (action === 'subscribe' && email) {
      const ss = getOrCreateSpreadsheet();
      const sheet = ss.getSheets()[0];
      
      // Append to sheet: Timestamp, Email
      sheet.appendRow([new Date(), email]);
      
      // Send Confirmation Email
      sendThankYouEmail(email);

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Subscribed successfully'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Invalid request'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendThankYouEmail(toEmail) {
  const subject = `Welcome to the ${APP_NAME} Newsletter! 🚀`;
  
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0e14; color: white; padding: 40px; border-radius: 20px; border: 1px solid #222;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00f2ff; margin: 0; font-size: 24px; letter-spacing: 2px;">${APP_NAME.toUpperCase()}</h1>
        <p style="color: #666; font-size: 12px; margin-top: 5px; text-transform: uppercase;">The Mesh Revolution</p>
      </div>
      <div style="line-height: 1.6; font-size: 16px;">
        <p>Hi there,</p>
        <p>Welcome to the AirLink community! We're thrilled to have you with us on our journey to build a truly decentralized world.</p>
        <p>You'll now be the first to know about:</p>
        <ul>
          <li>New feature announcements</li>
          <li>Research breakthroughs in Mesh technology</li>
          <li>Exclusive webinars and community calls</li>
          <li>Project milestones</li>
        </ul>
        <p>Stay connected, anywhere, anytime.</p>
        <p>Best regards,<br><b>The AirLink Team</b></p>
      </div>
      <hr style="border: 0; border-top: 1px solid #222; margin: 40px 0;">
      <div style="text-align: center; color: #666; font-size: 12px;">
        <p>&copy; 2026 AirLink Project. All Rights Reserved.</p>
        <p>You received this email because you subscribed to our newsletter at myairlink.vercel.app</p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    htmlBody: htmlBody
  });
}

function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(SHEET_NAME);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  
  const ss = SpreadsheetApp.create(SHEET_NAME);
  const sheet = ss.getSheets()[0];
  sheet.appendRow(["Timestamp", "Email Address"]);
  sheet.setFrozenRows(1);
  
  // Style headers
  sheet.getRange(1, 1, 1, 2).setBackground("#00F2FF").setFontColor("#000000").setFontWeight("bold");
  
  return ss;
}
