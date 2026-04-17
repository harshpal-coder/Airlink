/* 
  AIRLINK RECRUITMENT BACKEND v2.3 - "Auto-Repair"
  ----------------------------------------------
  This version is ultra-robust and will auto-fix column issues.
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

function updateApplicationStatus(e) {
  try {
    var rowId = parseInt(e.parameter.id);
    var newStatus = e.parameter.status;
    var ss = getOrCreateSpreadsheet();
    var sheet = ss.getSheets()[0];
    
    // 1. Get current headers
    var lastCol = Math.max(sheet.getLastColumn(), 1);
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    // 2. Find "Status" column (Robust search: ignore spaces and case)
    var statusColIndex = -1;
    for (var i = 0; i < headers.length; i++) {
        if (headers[i].toString().trim().toLowerCase() === "status") {
            statusColIndex = i + 1;
            break;
        }
    }
    
    // 3. AUTO-REPAIR: If missing, add it to the next empty column
    if (statusColIndex === -1) {
      statusColIndex = headers.length + 1;
      sheet.getRange(1, statusColIndex).setValue("Status");
      sheet.getRange(1, statusColIndex).setFontWeight("bold");
    }

    // 4. Update the specific row
    sheet.getRange(rowId, statusColIndex).setValue(newStatus);

    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Updated row ' + rowId + ' to ' + newStatus
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error', 
      message: 'Backend error: ' + err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// --- Rest of Helpers ---
function handleJobApplication(e) {
  try {
    var ss = getOrCreateSpreadsheet();
    var sheet = ss.getSheets()[0];
    var folder = getOrCreateFolder();
    var resumeData = Utilities.base64Decode(e.parameter.resumeData);
    var blob = Utilities.newBlob(resumeData, e.parameter.resumeType, e.parameter.resumeName);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
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

    return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

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
  ss.getSheets()[0].appendRow(["Timestamp", "Full Name", "Email", "Applied Role", "LinkedIn/GitHub", "Portfolio URL", "Resume Link", "Cover Letter", "Status"]);
  ss.getSheets()[0].setFrozenRows(1);
  return ss;
}

function getOrCreateFolder() {
  var name = "AirLink_Applicant_Resumes";
  var folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}
