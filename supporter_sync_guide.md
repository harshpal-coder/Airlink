# 🚀 Linking your Google Form to AirLink

Follow these steps to replace the "fake" data with your real Google Form submissions.

### Step 1: Create your Google Form
1. Create a new [Google Form](https://forms.google.com).
2. Add THREE questions:
   - **Name**: (Short answer)
   - **Amount**: (Number)
   - **Email**: (Short answer)
3. Go to the **Settings** tab and ensure responses are collected.

### Step 2: Link to a Google Sheet
1. Click the **Responses** tab in your Google Form.
2. Click **Link to Sheets** (the green icon).
3. Create a new spreadsheet.

### Step 3: Add the Sync & Email Script
1. In your new Google Sheet, go to **Extensions > Apps Script**.
2. Delete any existing code and **Paste the code below**:

```javascript
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const data = sheet.getDataRange().getValues();
  
  // Skip the header row (Timestamp, Name, Amount, Email)
  const supporters = data.slice(1).map(row => ({
    timestamp: row[0],
    name: row[1],
    amount: parseFloat(row[2]),
    email: row[3]
  }));

  return ContentService.createTextOutput(JSON.stringify(supporters))
    .setMimeType(ContentService.MimeType.JSON);
}

// Automatically sends a Thank You email when a form is submitted
function onFormSubmit(e) {
  const responses = e.values;
  const name = responses[1];
  const email = responses[3];
  
  if (email && email.includes('@')) {
    const subject = "Thank You for Supporting AirLink! 🚀";
    const body = "Hi " + name + ",\n\n" +
      "Thank you so much for supporting AirLink! Your contribution helps us build a more connected, decentralized world.\n\n" +
      "Your name will now appear on our official website's Supporters wall.\n\n" +
      "Stay connected,\n" +
      "The AirLink Team";
      
    MailApp.sendEmail(email, subject, body);
  }
}
```

### Step 4: Deploy as a Web App
1. Click **Deploy > New Deployment**.
2. Select **Web App**.
3. Description: `AirLink Supporter Sync`.
4. Execute as: **Me**.
5. Who has access: **Anyone** (This is crucial for the website to read the data).
6. Click **Deploy** and **Authorize Access**.
7. **Copy the Web App URL** (it should end in `/exec`).

### Step 5: Update the Website
1. Provide the **Web App URL** to me, and I will update the website's code to start pulling live data!

### Step 6: Enable Auto-Thank You Email (Important!)
To make the "Thank You" email work automatically, you must set up a **Trigger**:
1. In the Apps Script editor, click the **Triggers** icon (the alarm clock on the left sidebar).
2. Click **+ Add Trigger** at the bottom right.
3. Choose which function to run: `onFormSubmit`.
4. Select event source: **From spreadsheet**.
5. Select event type: **On form submit**.
6. Click **Save** and authorize any permissions if prompted.
