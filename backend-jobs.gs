/**
 * AIRLINK JOBS CMS BACKEND v1.0
 * ----------------------------
 * Handles dynamic job postings, status toggles, and metadata.
 * Separated from recruitment database as per architectural request.
 */

function doGet(e) {
  var action = e.parameter.action;
  
  // Public Endpoint: Fetch only open roles
  if (action === 'getPublicJobs') {
    return getJobs(true);
  }

  // Admin Endpoint: Fetch all roles (allowed via GET for better CORS handling)
  if (action === 'getAllJobs') {
    return getJobs(false);
  }
  
  return ContentService.createTextOutput("AirLink Jobs CMS Active");
}

function doPost(e) {
  var action = e.parameter.action;
  
  if (action === 'getAllJobs') { return getJobs(false); }
  if (action === 'upsertJob') { return upsertJob(e); }
  if (action === 'toggleStatus') { return toggleStatus(e); }
  if (action === 'deleteJob') { return deleteJob(e); }

  return ContentService.createTextOutput(JSON.stringify({status:'error', message:'Unknown action'})).setMimeType(ContentService.MimeType.JSON);
}

// 1. Fetch Jobs
function getJobs(publicOnly) {
  try {
    var ss = getOrCreateJobsDatabase();
    var sheet = ss.getSheets()[0];
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var jobs = [];
    
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var job = { rowIndex: i + 1 };
        
        for (var j = 0; j < headers.length; j++) {
            var key = headers[j].toString().toLowerCase().trim().replace(/ /g, "_");
            var val = row[j];
            
            // Handle JSON strings for arrays
            if (key === 'responsibilities' || key === 'requirements') {
              try { val = JSON.parse(val); } catch(e) { val = []; }
            }
            job[key] = val;
        }
        
        if (!publicOnly || job.status === 'Open') {
          jobs.push(job);
        }
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success', data: jobs})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

// 2. Create or Update Job
function upsertJob(e) {
  try {
    var ss = getOrCreateJobsDatabase();
    var sheet = ss.getSheets()[0];
    var rowIndex = e.parameter.rowIndex ? parseInt(e.parameter.rowIndex) : -1;
    
    var rowData = [
      e.parameter.id || Utilities.getUuid(),
      e.parameter.title,
      e.parameter.category,
      e.parameter.location,
      e.parameter.type,
      e.parameter.about,
      e.parameter.responsibilities, // Expecting JSON string
      e.parameter.requirements,    // Expecting JSON string
      e.parameter.status || 'Open',
      e.parameter.posted_date || new Date().toISOString()
    ];
    
    if (rowIndex > 1) {
      sheet.getRange(rowIndex, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Job saved successfully'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}

// 3. Toggle Open/Closed
function toggleStatus(e) {
    try {
        var ss = getOrCreateJobsDatabase();
        var sheet = ss.getSheets()[0];
        var rowIndex = parseInt(e.parameter.rowIndex);
        var newStatus = e.parameter.status; // 'Open' or 'Closed'
        
        sheet.getRange(rowIndex, 9).setValue(newStatus); // Column 9 is Status
        
        return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Status updated'})).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
    }
}

// 4. Delete Job
function deleteJob(e) {
    try {
        var ss = getOrCreateJobsDatabase();
        var sheet = ss.getSheets()[0];
        var rowIndex = parseInt(e.parameter.rowIndex);
        sheet.deleteRow(rowIndex);
        return ContentService.createTextOutput(JSON.stringify({status: 'success', message: 'Job deleted'})).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
        return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
    }
}

// --- DATABASE INITIALIZATION ---
function getOrCreateJobsDatabase() {
  var name = "AirLink_Jobs_Database";
  var files = DriveApp.getFilesByName(name);
  var ss;
  
  if (files.hasNext()) {
    ss = SpreadsheetApp.open(files.next());
  } else {
    ss = SpreadsheetApp.create(name);
    var sheet = ss.getSheets()[0];
    sheet.appendRow(["ID", "Title", "Category", "Location", "Type", "About", "Responsibilities", "Requirements", "Status", "Posted_Date"]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#f3f3f3");
  }
  return ss;
}
