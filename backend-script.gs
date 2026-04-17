/* 
  AIRLINK RECRUITMENT BACKEND v3.0 - "Email Automation"
  --------------------------------------------------
  Added: Professional HTML Auto-Replies for All Statuses.
*/

function doGet(e) {
  var action = e.parameter.action;
  if (action === 'getApplications') { return getApplications(e); }
  return ContentService.createTextOutput("AirLink Backend Active");
}

function doPost(e) {
  var action = e.parameter.action;
  if (action === 'submitApplication') { return handleJobApplication(e); }
  if (action === 'getApplications') { return getApplications(e); }
  if (action === 'updateStatus') { return updateApplicationStatus(e); }

  return ContentService.createTextOutput(JSON.stringify({status:'error', message:'Unknown action'})).setMimeType(ContentService.MimeType.JSON);
}

// 1. Handle New Applications
function handleJobApplication(e) {
  try {
    var ss = getOrCreateSpreadsheet();
    var sheet = ss.getSheets()[0];
    var folder = getOrCreateFolder();

    // Process Resume
    var resumeData = Utilities.base64Decode(e.parameter.resumeData);
    var blob = Utilities.newBlob(resumeData, e.parameter.resumeType, e.parameter.resumeName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Log Data
    sheet.appendRow([
      new Date(),
      e.parameter.name,
      e.parameter.email,
      e.parameter.role,
      e.parameter.linkedin,
      e.parameter.portfolio,
      file.getUrl(),
      e.parameter.cover,
      "New" 
    ]);

    // SEND CONFIRMATION EMAIL
    sendHiringEmail(e.parameter.email, e.parameter.name, e.parameter.role, "New");

    return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. Update Status + Email Trigger
function updateApplicationStatus(e) {
  try {
    var rowId = parseInt(e.parameter.id);
    var newStatus = e.parameter.status;
    var ss = getOrCreateSpreadsheet();
    var sheet = ss.getSheets()[0];
    
    // Get Row Data for Email
    var rowData = sheet.getRange(rowId, 1, 1, sheet.getLastColumn()).getValues()[0];
    var name = rowData[1];
    var email = rowData[2];
    var role = rowData[3];

    // Find "Status" column
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var statusColIndex = -1;
    for (var i = 0; i < headers.length; i++) {
        if (headers[i].toString().trim().toLowerCase() === "status") {
            statusColIndex = i + 1;
            break;
        }
    }
    
    if (statusColIndex === -1) {
      statusColIndex = headers.length + 1;
      sheet.getRange(1, statusColIndex).setValue("Status");
    }

    sheet.getRange(rowId, statusColIndex).setValue(newStatus);

    // TRIGGER EMAIL BASED ON STATUS
    sendHiringEmail(email, name, role, newStatus);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Status updated to ' + newStatus + ' and email sent.'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- EMAIL ENGINE ---

function sendHiringEmail(toEmail, name, role, status) {
  var subject = "";
  var message = "";
  
  switch(status) {
    case 'New':
      subject = "Application Received: " + role + " at AirLink";
      message = "Hi " + name + ",<br><br>Thank you for applying for the <b>" + role + "</b> position at AirLink. We've received your application and resume.<br><br>Our team is currently reviewing your background and we'll reach out to you if your profile matches our needs.<br><br>Welcome to the mesh revolution!";
      break;
    case 'Reviewing':
      subject = "Application Update: " + role + " at AirLink";
      message = "Hi " + name + ",<br><br>Just a quick update: your application for <b>" + role + "</b> is currently being reviewed by our selection committee.<br><br>We appreciate your patience as we carefully consider each candidate.";
      break;
    case 'Interviewing':
      subject = "Interview Invitation: " + role + " at AirLink";
      message = "Great news " + name + "!<br><br>We were very impressed with your application for the <b>" + role + "</b> position and would like to invite you to an interview.<br><br>Please keep an eye on your inbox, as one of our team members will reach out shortly to schedule a time.";
      break;
    case 'Hired':
      subject = "Welcome to AirLink! | Offer for " + role;
      message = "Big Congratulations " + name + "!<br><br>After our final review, we would love to have you join the AirLink team as our new <b>" + role + "</b>.<br><br>We are thrilled to embark on this journey with you!";
      break;
    case 'Rejected':
      subject = "Application Status: " + role + " at AirLink";
      message = "Dear " + name + ",<br><br>Thank you for your interest in AirLink and for the time you spent applying for the <b>" + role + "</b> position.<br><br>After careful consideration, we have decided to move forward with other candidates at this time. We wish you the best of luck in your search!";
      break;
    default: return; // No email for unknown states
  }

  var htmlBody = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #050505; color: white; padding: 40px; border-radius: 20px; border: 1px solid #222;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00f2ff; margin: 0; font-size: 24px; letter-spacing: 2px;">AIRLINK</h1>
        <p style="color: #666; font-size: 12px; margin-top: 5px; text-transform: uppercase;">The Mesh Revolution</p>
      </div>
      <div style="line-height: 1.6; font-size: 16px;">
        ${message}
      </div>
      <hr style="border: 0; border-top: 1px solid #222; margin: 40px 0;">
      <div style="text-align: center; color: #666; font-size: 12px;">
        <p>&copy; 2026 AirLink Systems. All Rights Reserved.</p>
        <p>You received this email because you applied for a position at AirLink.</p>
      </div>
    </div>
  `;

  MailApp.sendEmail({
    to: toEmail,
    subject: subject,
    htmlBody: htmlBody
  });
}

// --- Helpers ---
function getApplications(e) {
  try {
    var ss = getOrCreateSpreadsheet();
    var sheet = ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var jsonArray = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      var rowObject = { id: i + 1 };
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j].toString().toLowerCase().trim().replace(/ /g, "_").replace(/\//g, "");
        rowObject[key || "column_"+j] = row[j];
      }
      jsonArray.push(rowObject);
    }
    return ContentService.createTextOutput(JSON.stringify({status: 'success', data: jsonArray})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSpreadsheet() {
  var name = "AirLink_Recruitment_Database";
  var files = DriveApp.getFilesByName(name);
  if (files.hasNext()) return SpreadsheetApp.open(files.next());
  var ss = SpreadsheetApp.create(name);
  var sheet = ss.getSheets()[0];
  sheet.appendRow(["Timestamp", "Full Name", "Email", "Applied Role", "LinkedIn/GitHub", "Portfolio URL", "Resume Link", "Cover Letter", "Status"]);
  sheet.setFrozenRows(1);
  return ss;
}

function getOrCreateFolder() {
  var name = "AirLink_Applicant_Resumes";
  var folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}
