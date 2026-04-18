/* 
  AIRLINK NEWSLETTER BACKEND v2.0 - "AI & Automation"
  --------------------------------------------------
  - AI News Generation (Gemini)
  - Scheduled Weekend Broadcasts (Sat/Sun 11AM/8PM)
  - Unsubscribe Management
*/

const APP_NAME = "AirLink";
const SHEET_NAME = "AirLink_Newsletter_Subscribers";

// --- CORE HANDLERS ---

function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'unsubscribe') {
    return handleUnsubscribe(e.parameter.email);
  }
  
  return ContentService.createTextOutput("AirLink Newsletter Backend Active");
}

function doPost(e) {
  try {
    const email = e.parameter.email;
    const action = e.parameter.action;

    if (action === 'subscribe' && email) {
      const ss = getOrCreateSpreadsheet();
      const sheet = ss.getSheets()[0];
      
      // Check if already exists
      const data = sheet.getDataRange().getValues();
      let found = false;
      for (let i = 1; i < data.length; i++) {
        if (data[i][1] === email) {
          sheet.getRange(i + 1, 3).setValue("Active"); // Re-activate
          found = true;
          break;
        }
      }

      if (!found) {
        sheet.appendRow([new Date(), email, "Active"]);
      }
      
      sendWelcomeEmail(email);

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

// --- AI CONTENT GENERATION ---

function generateAINewsContent() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    return {
      thought: "The strength of the mesh is the shared connection of the collective.",
      news: "Researchers are seeing a massive surge in decentralized protocol adoption this quarter."
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const prompt = `Generate content for the AirLink Newsletter. 
  1. A futuristic, inspiring "Thought of the Day" about decentralization or mesh networking. (Max 30 words).
  2. One exciting, real or plausible "Tech Update" regarding offline communication or P2P technology. (Max 40 words).
  Return JSON format: {"thought": "...", "news": "..."}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { response_mime_type: "application/json" }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(endpoint, options);
    const json = JSON.parse(response.getContentText());
    if (json.candidates && json.candidates[0].content.parts[0].text) {
      return JSON.parse(json.candidates[0].content.parts[0].text);
    }
  } catch (e) {
    console.error("AI Generation Error:", e);
  }

  return {
    thought: "A connected world doesn't need a single point of failure.",
    news: "Decentralized mesh protocols are becoming the standard for resilient urban infrastructure."
  };
}

// --- BROADCAST SYSTEM ---

/**
 * Main function called by triggers on Sat/Sun
 */
function broadcastWeekendNewsletter() {
  const content = generateAINewsContent();
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  const scriptUrl = getScriptUrl();

  for (let i = 1; i < data.length; i++) {
    const email = data[i][1];
    const status = data[i][2];

    if (status === "Active" && email) {
      sendNewsletterEmail(email, content, scriptUrl);
    }
  }
}

function sendNewsletterEmail(toEmail, content, scriptUrl) {
  const unsubscribeLink = `${scriptUrl}?action=unsubscribe&email=${encodeURIComponent(toEmail)}`;
  
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0e14; color: white; padding: 40px; border-radius: 20px; border: 1px solid #222;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00f2ff; margin: 0; font-size: 24px; letter-spacing: 2px;">AIRLINK WEEKEND</h1>
        <p style="color: #666; font-size: 12px; margin-top: 5px; text-transform: uppercase;">Thought News Broadcast</p>
      </div>
      
      <div style="background: rgba(0, 242, 255, 0.05); padding: 25px; border-radius: 15px; margin-bottom: 30px; border-left: 4px solid #00f2ff;">
        <h3 style="color: #00f2ff; margin-top: 0;">Thought of the Day</h3>
        <p style="font-size: 18px; font-style: italic; line-height: 1.5;">"${content.thought}"</p>
      </div>

      <div style="margin-bottom: 40px;">
        <h3 style="color: #7000ff;">Mesh News Update</h3>
        <p style="font-size: 16px; color: #ccc; line-height: 1.6;">${content.news}</p>
      </div>

      <div style="text-align: center;">
        <a href="https://myairlink.vercel.app" style="display: inline-block; padding: 12px 30px; background: #00f2ff; color: #0b0e14; text-decoration: none; border-radius: 50px; font-weight: bold;">Explore the Mesh</a>
      </div>

      <hr style="border: 0; border-top: 1px solid #222; margin: 40px 0;">
      
      <div style="text-align: center; color: #666; font-size: 12px;">
        <p>&copy; 2026 AirLink Project. All Rights Reserved.</p>
        <p>Stay connected, anywhere, anytime.</p>
        <p style="margin-top: 20px;">
          <a href="${unsubscribeLink}" style="color: #444; text-decoration: underline;">Unsubscribe</a> from these broadcasts
        </p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: toEmail,
    subject: `AirLink Weekend: ${content.thought.substring(0, 30)}...`,
    htmlBody: htmlBody,
    name: "AirLink"
  });
}

// --- SUBSCRIPTION HELPERS ---

function handleUnsubscribe(email) {
  if (!email) return ContentService.createTextOutput("Email missing.");
  
  const ss = getOrCreateSpreadsheet();
  const sheet = ss.getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  let found = false;
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === email) {
      sheet.getRange(i + 1, 3).setValue("Unsubscribed");
      found = true;
      break;
    }
  }
  
  const html = `
    <div style="font-family: sans-serif; text-align: center; padding: 50px; background: #0b0e14; color: white; height: 100vh;">
      <h1 style="color: #00f2ff;">You've been unsubscribed.</h1>
      <p style="color: #888;">We're sorry to see you go. You'll no longer receive our weekend broadcasts.</p>
      <a href="https://myairlink.vercel.app" style="color: #00f2ff;">Return to AirLink</a>
    </div>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

function sendWelcomeEmail(toEmail) {
  const subject = `Welcome to the AirLink Newsletter! 🚀`;
  const htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0b0e14; color: white; padding: 40px; border-radius: 20px; border: 1px solid #222;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00f2ff; margin: 0; font-size: 24px; letter-spacing: 2px;">AIRLINK</h1>
        <p style="color: #666; font-size: 12px; margin-top: 5px; text-transform: uppercase;">The Mesh Revolution</p>
      </div>
      <div style="line-height: 1.6; font-size: 16px;">
        <p>Hi there,</p>
        <p>Welcome to the AirLink community! We're thrilled to have you with us.</p>
        <p>You'll receive our "Thought News" every Saturday and Sunday at 11:00 AM and 08:00 PM.</p>
        <p>Best regards,<br><b>The AirLink Team</b></p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    htmlBody: htmlBody,
    name: "AirLink"
  });
}

// --- SYSTEM HELPERS ---

function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(SHEET_NAME);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  
  const ss = SpreadsheetApp.create(SHEET_NAME);
  const sheet = ss.getSheets()[0];
  sheet.appendRow(["Timestamp", "Email Address", "Status"]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, 3).setBackground("#00F2FF").setFontColor("#000000").setFontWeight("bold");
  return ss;
}

function getScriptUrl() {
  return ScriptApp.getService().getUrl();
}

/**
 * RUN MANUALLY ONCE TO SETUP TRIGGERS
 */
function createWeekendTriggers() {
  // Clear existing triggers to avoid duplicates
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => {
    if (t.getHandlerFunction() === 'broadcastWeekendNewsletter') {
      ScriptApp.deleteTrigger(t);
    }
  });

  const days = [ScriptApp.WeekDay.SATURDAY, ScriptApp.WeekDay.SUNDAY];
  const hours = [11, 20]; // 11 AM and 8 PM (20:00)

  days.forEach(day => {
    hours.forEach(hour => {
      ScriptApp.newTrigger('broadcastWeekendNewsletter')
        .timeBased()
        .onWeekDay(day)
        .atHour(hour)
        .nearMinute(0)
        .create();
    });
  });
  
  console.log("Triggers created for Saturday and Sunday at 11:00 AM and 08:00 PM.");
}

/**
 * TEST FUNCTION: Send a sample newsletter to yourself
 */
function testNewsletter() {
  const myEmail = Session.getActiveUser().getEmail();
  const content = generateAINewsContent();
  const scriptUrl = getScriptUrl();
  sendNewsletterEmail(myEmail, content, scriptUrl);
}
