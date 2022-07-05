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
    
    const row = SpreadsheetApp
      .getActive()
      .getSheetByName('Settings')
      .getRange('B1:B4')
      .getValues()
    
    return {
      clientId     : row[0][0],
      clientSecret : row[1][0],
      startDate    : row[2][0],
      rootFolder   : row[3][0]
    }
  }
  
  ns.getAccessToken = function() {
    if (!AccessToken_) {
      AccessToken_ = ScriptApp.getOAuthToken();
    }
    return AccessToken_;
  };

  return ns
  
})({}) 