// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// BackupList_.gs
// ==============
//
// Manage the ID list of media already backed up

function test_BackupList() {
  BackupList_.removeKeyUsingName('20220801_112518.mp4')
  debugger
}

var BackupList_ = (function(ns) {

  ns.dump = function() {
    var backupList = PropertiesService
      .getUserProperties()
      .getProperty(BACKUP_LIST_NAME_)
    log_(backupList)
  } 

  ns.reset = function() {
    PropertiesService
      .getUserProperties()
      .deleteProperty(BACKUP_LIST_NAME_)
  } 

  ns.get = function() {
    var backupList = PropertiesService
      .getUserProperties()
      .getProperty(BACKUP_LIST_NAME_)
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
        BACKUP_LIST_NAME_, 
        JSON.stringify(backupList))
  }

  ns.getValue = function(backupList, key) {
    return backupList[key]
  }

  ns.setValue = function(backupList, key, value) {
//    log_('value: ' + JSON.stringify(value))
    backupList[key] = value
  }

  ns.removeKey = function(backupList, key) {
    delete backupList[key]
  }

  ns.findKeyFromName = function(backupList, name) {
    let key = null
    for (let nextKey in backupList) {
      if (!backupList.hasOwnProperty(key)) continue
      if (backupList[key].name === name) {
        key = nextKey
      }
    }
    return key
  }

  ns.removeKeyUsingName = function(name) {
    let list = BackupList_.get()
    const key = BackupList_.findKeyFromName(list, name)
    BackupList_.removeKey(list, key)
    BackupList_.store(list)
  }

  return ns

})(BackupList_ || {})