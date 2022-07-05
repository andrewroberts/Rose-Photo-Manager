// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// Utils_.gs
// =========

function log_(message) {
  if (!Log_) Log_ = Utils_.getLogSheet()
  Log_.appendRow([new Date(), message])
}

const Utils_ = (function(ns) {

  ns.getLogSheet = function() {
    var spreadsheet = SpreadsheetApp.getActive()
    var sheet = spreadsheet.getSheetByName('Log')
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Log')
    }
    return sheet
  }
  
  ns.getSettings = function() {
    let settings = {}
    SpreadsheetApp
      .getActive()
      .getSheetByName('Settings')
      .getRange('B1:B2')
      .getValues()
    settings.startDate = row[0][0]
    settings.rootFolder = row[1][0]
    settings.maxFileSize = row[2][0]
    return settings
  }
  
  return ns
  
})({}) 