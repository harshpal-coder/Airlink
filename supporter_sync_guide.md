# 🚀 Linking your Google Form to AirLink

Follow these steps to replace the "fake" data with your real Google Form submissions.

### Step 1: Create your Google Form
1. Create a new [Google Form](https://forms.google.com).
2. Add THREE questions:
   - **Name**: (Short answer)
   - **Amount**: (Number)
   - **Email**: (Short answer)
3. Go to the **Settings** tab and ensure responses are collected.
4. **Mandatory**: Open the linked Google Sheet and add a header **"Status"** in Column E (to track sent emails).

### Step 2: Link to a Google Sheet
1. Click the **Responses** tab in your Google Form.
2. Click **Link to Sheets** (the green icon).
3. Create a new spreadsheet.

### Step 3: Add the Sync & Email Script
1. In your new Google Sheet, go to **Extensions > Apps Script**.
2. Delete any existing code and **Paste the code below**:

```javascript
/**
 * AIRLINK SUPPORTER MASTER SCRIPT (v2.0 - PDF Cert Edition)
 * Features: Auto-Ranking, Premium HTML Email, PDF Certificate Attachment
 */

function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = sheet.getDataRange().getValues();
  const supporters = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] && data[i][2]) {
      supporters.push({
        name: data[i][1],
        amount: data[i][2],
        email: data[i][3] || ""
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(supporters))
    .setMimeType(ContentService.MimeType.JSON);
}

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 AirLink Tools')
    .addItem('Send Pending Emails (with PDF)', 'sendPendingEmails')
    .addItem('Send Email to Selected Row', 'sendEmailToSelectedRow')
    .addToUi();
}

/**
 * Sends emails with PDF attachments to anyone without "Sent" status
 */
function sendPendingEmails() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const name = data[i][1];
    const amount = data[i][2];
    const email = data[i][3];
    const status = data[i][4];
    const rank = i; // Current row index is the rank

    if (email && email.includes('@') && status !== 'Sent') {
      try {
        sendThankYouEmail(email, name, amount, rank);
        sheet.getRange(i + 1, 5).setValue('Sent');
        SpreadsheetApp.flush(); // Update sheet immediately
      } catch (e) {
        Logger.log('Error sending to ' + email + ': ' + e);
      }
    }
  }
}

/**
 * Sends email only to the currently selected row(s) in the sheet
 */
function sendEmailToSelectedRow() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const activeRange = sheet.getActiveRange();
  const startRow = activeRange.getRow();
  const numRows = activeRange.getNumRows();
  const data = sheet.getDataRange().getValues();

  let sentCount = 0;

  for (let i = 0; i < numRows; i++) {
    const currentRowIndex = startRow + i;
    if (currentRowIndex === 1) continue; // Skip header row

    const rowData = data[currentRowIndex - 1];
    if (!rowData) continue;

    const name = rowData[1];
    const amount = rowData[2];
    const email = rowData[3];
    const rank = currentRowIndex - 1;

    if (email && email.includes('@')) {
      try {
        sendThankYouEmail(email, name, amount, rank);
        sheet.getRange(currentRowIndex, 5).setValue('Sent');
        sentCount++;
      } catch (e) {
        Logger.log('Error sending to ' + email + ': ' + e);
      }
    }
  }
  
  if (sentCount > 0) {
    SpreadsheetApp.flush();
    SpreadsheetApp.getUi().alert('Successfully sent ' + sentCount + ' email(s).');
  } else {
    SpreadsheetApp.getUi().alert('No emails sent. Please select a row with a valid email address.');
  }
}

/**
 * Triggered automatically on form submission
 */
function onFormSubmit(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const responses = e.values;
  const name = responses[1];
  const amount = responses[2];
  const email = responses[3];
  const rank = sheet.getLastRow(); // New row index is the rank
  
  if (email && email.includes('@')) {
    sendThankYouEmail(email, name, amount, rank);
    sheet.getRange(rank, 5).setValue('Sent');
  }
}

/**
 * Generates a Premium Modern Tech PDF Certificate
 */
function generateCertificatePDF(name, rank) {
  // Generate Official Date and ID
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateObj = new Date();
  const issueDate = monthNames[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear();
  const certID = "AL-" + dateObj.getFullYear() + "-" + String(rank).padStart(4, '0');

  // Helper function to fetch image and convert to Base64
  const getImageBase64 = (url) => {
    try {
      const resp = UrlFetchApp.fetch(url);
      const encoded = Utilities.base64Encode(resp.getContent());
      const type = resp.getHeaders()['Content-Type'] || 'image/png';
      return `data:${type};base64,${encoded}`;
    } catch (e) {
      Logger.log("Error fetching image " + url + ": " + e);
      return url; // Fallback to URL if fetch fails
    }
  };

  const qrCodeBase64 = getImageBase64(`https://quickchart.io/qr?text=https://myairlink.vercel.app&dark=00f2ff&light=050a10&size=100&margin=0`);
  const signatureBase64 = getImageBase64(`https://myairlink.vercel.app/assets/signature.png`);

  const html = `
    <html>
      <head>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          @media print {
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
          html, body {
            margin: 0; padding: 0;
            width: 100%; height: 100%;
            background-color: #050a10;
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; height: 100%; background-color: #050a10; background-image: linear-gradient(#050a10, #050a10); border: 20px solid #00f2ff; padding: 50px; color: #ffffff; font-family: sans-serif; position: relative; overflow: hidden; box-sizing: border-box;">
          
          <!-- Watermark -->
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 500px; height: 500px; background-image: url('data:image/png;base64,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'); background-repeat: no-repeat; background-position: center; background-size: contain; opacity: 0.1; z-index: 0; filter: grayscale(100%);"></div>

          <!-- Decorative Corners -->
          <div style="position: absolute; top: 0; left: 0; width: 120px; height: 120px; border-top: 6px solid #7000ff; border-left: 6px solid #7000ff; z-index: 1;"></div>
          <div style="position: absolute; bottom: 0; right: 0; width: 120px; height: 120px; border-bottom: 6px solid #7000ff; border-right: 6px solid #7000ff; z-index: 1;"></div>

          <!-- Official Stamp -->
          <div style="position: absolute; top: 35px; right: 45px; width: 110px; height: 110px; border-radius: 50%; border: 3px solid #00f2ff; text-align: center; opacity: 0.9; z-index: 1; background-color: rgba(0, 242, 255, 0.05);">
            <div style="width: 90px; height: 90px; border-radius: 50%; border: 2px solid #00f2ff; margin: 8px auto; position: relative;">
              <div style="width: 80px; height: 80px; border-radius: 50%; border: 1px solid rgba(0, 242, 255, 0.5); margin: 4px auto; position: relative;">
                <div style="position: absolute; top: 50%; left: 0; right: 0; margin-top: -22px;">
                  <p style="font-size: 8px; color: #7000ff; margin: 0; font-weight: bold; letter-spacing: 2px;">★ 100% ★</p>
                  <p style="font-size: 10px; color: #00f2ff; margin: 2px 0 0 0; font-weight: bold; letter-spacing: 1px;">AUTHENTIC</p>
                  <div style="height: 1px; width: 60px; background: #00f2ff; margin: 3px auto;"></div>
                  <p style="font-size: 14px; color: #ffffff; margin: 0; font-style: italic; font-weight: bold;">AirLink</p>
                </div>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin-top: 10px; position: relative; z-index: 2;">
            <h3 style="color: #00f2ff; letter-spacing: 5px; margin: 0;">OFFICIAL AIRLINK SUPPORTER</h3>
            <h1 style="font-size: 80px; margin: 10px 0; color: #ffffff; letter-spacing: 2px;">CERTIFICATE</h1>
            <p style="font-size: 22px; color: #8e8e8e; margin: 0; letter-spacing: 8px;">OF APPRECIATION</p>
          </div>

          <div style="text-align: center; margin-top: 25px; position: relative; z-index: 2;">
            <p style="font-size: 24px; color: #d0d0d0; margin: 0;">This certificate is proudly presented to</p>
            <h2 style="font-size: 70px; color: #00f2ff; margin: 20px 0; border-bottom: 3px solid rgba(0, 242, 255, 0.2); display: inline-block; padding: 0 60px; font-weight: bold;">
              ${name}
            </h2>
            <br>
            <p style="font-size: 20px; color: #a0a0a0; margin-top: 25px; max-width: 800px; display: inline-block; line-height: 1.6;">
              In recognition of their instrumental support and contribution towards building a decentralized, secure, and connected world.
            </p>
          </div>

          <!-- Bottom Info -->
          <div style="margin-top: 15px; position: relative; z-index: 2;">
            <table width="100%" style="color: #ffffff;">
              <tr>
                <td width="33%" align="left" valign="bottom">
                  <img src="${qrCodeBase64}" style="margin-bottom: 12px; border: 1px solid rgba(0, 242, 255, 0.3); padding: 4px; border-radius: 4px;" width="65" height="65" alt="QR Code" />
                  <p style="color: #00f2ff; font-size: 12px; margin: 0;">CERTIFICATE ID</p>
                  <p style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 5px 0;">${certID}</p>
                </td>
                <td width="33%" align="center" valign="bottom" style="padding-bottom: 10px;">
                  <!-- Mesh Waveform / Pulse -->
                  <div style="margin-bottom: 25px; opacity: 0.5;">
                    <div style="display: inline-block; width: 4px; height: 15px; background: #00f2ff; margin: 0 2px; border-radius: 2px;"></div>
                    <div style="display: inline-block; width: 4px; height: 25px; background: #7000ff; margin: 0 2px; border-radius: 2px;"></div>
                    <div style="display: inline-block; width: 4px; height: 40px; background: #00f2ff; margin: 0 2px; border-radius: 2px;"></div>
                    <div style="display: inline-block; width: 4px; height: 20px; background: #7000ff; margin: 0 2px; border-radius: 2px;"></div>
                    <div style="display: inline-block; width: 4px; height: 35px; background: #00f2ff; margin: 0 2px; border-radius: 2px;"></div>
                  </div>
                  <p style="color: #8e8e8e; font-size: 11px; margin: 0; letter-spacing: 2px;">DATE OF ISSUE</p>
                  <p style="color: #ffffff; font-size: 18px; margin: 5px 0; font-weight: bold;">${issueDate}</p>
                </td>
                <td width="33%" align="right" valign="bottom">
                  <div style="display: inline-block; text-align: center;">
                    <img src="${signatureBase64}" style="height: 90px; width: auto; opacity: 0.9; margin-bottom: -35px; position: relative; z-index: 10;" alt="Harshpal" />
                    <div style="width: 150px; height: 1px; background: #00f2ff; margin: 0 auto 5px auto; position: relative; z-index: 5;"></div>
                    <p style="color: #8e8e8e; font-size: 10px; margin: 0 0 5px 0; letter-spacing: 1px; padding-top: 15px;">FOUNDER SIGNATURE</p>
                  </div>
                </td>
              </tr>
            </table>

            <div style="text-align: center; margin-top: 15px;">
              <p style="font-size: 10px; color: #555555; margin: 0; letter-spacing: 1px;">VERIFIED BY AIRLINK NETWORK PROTOCOL &bull; 2026</p>
            </div>
          </div>
        </div>
    </html>
  `;
  
  const blob = Utilities.newBlob(html, "text/html", "AirLink_Certificate.html");
  return blob.getAs("application/pdf").setName("AirLink_Support_Certificate_" + name + ".pdf");
}

/**
 * Sends a premium HTML email with PDF attachment
 */
function sendThankYouEmail(email, name, amount, rank) {
  const subject = "Official AirLink Supporter Certificate - #" + rank + " 🚀";
  const websiteUrl = "https://myairlink.vercel.app/"; 
  const githubUrl = "https://github.com/harshpal-coder/Airlink-App";
  const downloadUrl = "https://myairlink.vercel.app/#download";
  
  const pdfBlob = generateCertificatePDF(name, rank);
  
  const htmlBody = `
    <div style="background-color: #050a10; padding: 40px 20px; font-family: sans-serif; color: #ffffff; line-height: 1.6;">
      <div style="max-width: 700px; margin: 0 auto; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(0, 242, 255, 0.1); border-radius: 24px; padding: 50px;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 36px; color: #00f2ff; letter-spacing: 2px;">AIRLINK</h1>
          <div style="height: 2px; background: linear-gradient(90deg, transparent, #00f2ff, transparent); width: 100px; margin: 20px auto 40px auto;"></div>
        </div>

        <!-- Greeting -->
        <h2 style="color: #ffffff; font-size: 24px; margin-top: 0;">Hi ${name},</h2>
        
        <p style="color: #d0d0d0; font-size: 17px; line-height: 1.8;">
          Welcome to the mesh! We are absolutely thrilled to have you as part of the AirLink family. Your belief in our vision fuels everything we do.
        </p>

        <p style="color: #a0a0a0; font-size: 16px; line-height: 1.8;">
          AirLink isn't just an app; it's a movement towards <b>decentralized, offline-first communication</b>. Because of early supporters like you, we are one step closer to building a network that empowers people everywhere&mdash;without relying on traditional internet infrastructure.
        </p>

        <!-- Highlight Box -->
        <div style="background-color: #0a1118; border: 1px solid rgba(0, 242, 255, 0.2); border-radius: 16px; padding: 30px; margin: 40px 0; text-align: center;">
          <p style="margin: 0 0 15px 0; color: #a0a0a0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase;">Official Supporter Status</p>
          
          <div style="display: inline-block; margin: 0 20px;">
            <span style="display: block; font-size: 11px; color: #888;">SUPPORTER RANK</span>
            <span style="font-size: 32px; font-weight: bold; color: #00f2ff;">#${rank}</span>
          </div>
          
          <div style="display: inline-block; width: 1px; height: 35px; background-color: rgba(255,255,255,0.1); vertical-align: top; margin-top: 5px;"></div>
          
          <div style="display: inline-block; margin: 0 20px;">
            <span style="display: block; font-size: 11px; color: #888;">CONTRIBUTION</span>
            <span style="font-size: 32px; font-weight: bold; color: #ffffff;">₹${amount}</span>
          </div>
        </div>

        <p style="color: #a0a0a0; font-size: 16px; line-height: 1.8; margin-bottom: 40px;">
          As a token of our deepest appreciation, we have attached your <b>Official Digital Certificate</b> to this email. It represents your crucial role in the foundation of the AirLink Protocol.
        </p>

        <!-- Buttons -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="${downloadUrl}" style="background: #00f2ff; color: #050a10; text-decoration: none; padding: 14px 30px; border-radius: 50px; font-weight: bold; display: inline-block; margin: 0 10px 15px 0; font-size: 16px;">
            📲 Get AirLink App
          </a>
          <a href="${githubUrl}" style="background: #1a2634; color: #ffffff; border: 1px solid #2a3b4c; text-decoration: none; padding: 14px 30px; border-radius: 50px; font-weight: bold; display: inline-block; font-size: 16px;">
            ⭐ Star on GitHub
          </a>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid rgba(255,255,255,0.05); padding-top: 30px; margin-top: 40px;">
          <p style="color: #888888; font-size: 15px; margin: 0;">
            Onwards & Upwards, <br>
            <strong style="color: #d0d0d0;">Harshpal</strong> & The AirLink Team
          </p>
          <p style="font-size: 12px; color: #555555; text-align: center; margin-top: 40px;">
            VERIFIED BY AIRLINK NETWORK PROTOCOL &bull; 2026<br>
            Developed by Harshpal &bull; MIT Licensed
          </p>
        </div>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    attachments: [pdfBlob],
    name: "AirLink"
  });
}
```

### Step 4: Deploy as a Web App
1. Click **Deploy > New Deployment**.
2. Select **Web App**.
3. Description: `AirLink Supporter Sync`.
4. Execute as: **Me**.
5. Who has access: **Anyone** (This is crucial for the website to read the data).
6. Click **Deploy** and **Authorize Access**.
7. **Copy the Web App URL**.

### Step 5: Update the Website
1. Provide the **Web App URL** to me, and I will update the website's code to start pulling live data!

### Step 6: Enable Auto-Thank You Email
To make the "Thank You" email work automatically for NEW submissions, you must set up a **Trigger**:
1. In the Apps Script editor, click the **Triggers** icon (the alarm clock).
2. Click **+ Add Trigger**.
3. Choose: `onFormSubmit` | **From spreadsheet** | **On form submit**.
4. Click **Save**.

### Step 7: Sending to Existing Data (Manually)
If you have old data that didn't get a mail:
1. Refresh your Google Sheet tab.
2. You will see a new menu at the top: **🚀 AirLink Tools**.
3. Click **Send Pending Emails**. This will send a mail to anyone who doesn't have "Sent" in the Status column.
