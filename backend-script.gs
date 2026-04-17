/* 
  AIRLINK RECRUITMENT BACKEND
  ---------------------------
  Paste this into your Google Apps Script Editor.
  It manages a dedicated Spreadsheet and Drive folder for your hiring.
*/

function doPost(e) {
  var action = e.parameter.action;
  
  if (action === 'submitApplication') {
    return handleJobApplication(e);
  }
  
  // Keep your existing 'chat' or 'supporter' actions here
}

function handleJobApplication(e) {
  try {
    // 1. DEDICATED NEW SPREADSHEET 
    var ssName = "AirLink_Recruitment_Database"; // You can change this name
    var files = DriveApp.getFilesByName(ssName);
    var ss;
    
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      // Create a brand new Spreadsheet if it doesn't exist
      ss = SpreadsheetApp.create(ssName);
      ss.getSheets()[0].appendRow([
        "Timestamp", "Full Name", "Email", "Applied Role", 
        "LinkedIn/GitHub", "Portfolio URL", "Resume Link", "Cover Letter"
      ]);
      // Freeze the top row for a professional look
      ss.getSheets()[0].setFrozenRows(1);
    }
    var sheet = ss.getSheets()[0];

    // 2. RESUME ASSETS FOLDER
    var folderName = "AirLink_Applicant_Resumes";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

    // 3. PROCESS RESUME UPLOAD
    var resumeData = Utilities.base64Decode(e.parameter.resumeData);
    var blob = Utilities.newBlob(resumeData, e.parameter.resumeType, e.parameter.resumeName);
    var file = folder.createFile(blob);
    
    // Make file viewable by link so you can click it in the Sheet
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var resumeUrl = file.getUrl();

    // 4. LOG DATA
    sheet.appendRow([
      new Date(),
      e.parameter.name,
      e.parameter.email,
      e.parameter.role,
      e.parameter.linkedin,
      e.parameter.portfolio,
      resumeUrl,
      e.parameter.cover
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Database updated'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
