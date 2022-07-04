// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// BackupList_.gs
// ===========
//
// Manage the ID list of media already backed up

function test_BackupList() {
//  BackupList_.reset()
  BackupList_.dump()

//  var backupList = BackupList_.get()
//  BackupList_.setValue(backupList, 1, {a:1,b:2})
//  BackupList_.store(backupList)
//  var backupList1 = BackupList_.get()
  
  debugger
}

var BackupList_ = (function(ns) {

  ns.dump = function() {
    initPhotosManager_()  
    var backupList = PropertiesService
      .getUserProperties()
      .getProperty('PhotosManager_BackupList')
    log_(backupList)
  } 

  ns.reset = function() {
    PropertiesService
      .getUserProperties()
      .deleteProperty('PhotosManager_BackupList')
  } 

  ns.get = function() {
    var backupList = PropertiesService
      .getUserProperties()
      .getProperty('PhotosManager_BackupList')
    if (backupList === null) {
      backupList = {}
    } else {
      backupList = JSON.parse(backupList)
    }
    return backupList
  }

  ns.store = function(backupList) {
    PropertiesService
      .getUserProperties()
      .setProperty(
        'PhotosManager_BackupList', 
        JSON.stringify(backupList))
  }

  ns.getValue = function(backupList, key) {
    return backupList[key]
  }

  ns.setValue = function(backupList, key, value) {
//    log_('value: ' + JSON.stringify(value))
    backupList[key] = value
  }

  return ns

})(BackupList_ || {})