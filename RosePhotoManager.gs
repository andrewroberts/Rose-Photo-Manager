
// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// RosePhotoManager.gs
// ===================
//
// Dev: AndrewRoberts.net
//
// External interface to this script - all of the event handlers.
//
// This files contains all of the event handlers.

let Log_ = null
let Service_ = null
let CalledFromInstallableTrigger_ = false
let Settings_ = null
let AccessToken_ = null

// Public event handlers
// ---------------------
//
// All external event handlers need to be top-level function calls; they can't 
// be part of an object, and to ensure they are all processed similarily 
// for things like logging and error handling, they all go through 
// errorHandler_(). These can be called from custom menus, web apps, 
// triggers, etc
// 
// The main functionality of a call is in a function with the same name but 
// post-fixed with an underscore (to indicate it is private to the script)
//
// For debug, rather than production builds, lower level functions are exposed
// in the menu

var EVENT_HANDLERS_ = {

//                           Name                            onError Message                          Main Functionality
//                           ----                            ---------------                          ------------------

  listMediaNotInAnAlbum:     ['listMediaNotInAnAlbum()',     'Failed to list media not in albums',    listMediaNotInAnAlbum_],
  copyAlbums:                ['copyAlbums()',                'Failed to copy albums',                 copyAlbums_],
  copyMedia:                 ['copyMedia()',                 'Failed to copy media',                  copyMedia_],
  copyAllMedia:              ['copyAllMedia_()',             'Failed to copy all media',              copyAllMedia_],
  showSidebar:               ['showSidebar()',               'Failed to showSidebar',                 showSidebar_],
  clearProps:                ['clearProps()',                'Failed to clear props',                 clearProps_],
}

function listMediaNotInAnAlbum(args) {return eventHandler_(EVENT_HANDLERS_.listMediaNotInAnAlbum, args)}
function copyAlbums(args) {return eventHandler_(EVENT_HANDLERS_.copyAlbums, args)}
function copyMedia(args) {return eventHandler_(EVENT_HANDLERS_.copyMedia, args)}
function copyAllMedia(args) {return eventHandler_(EVENT_HANDLERS_.copyAllMedia, args)}
function showSidebar(args) {return eventHandler_(EVENT_HANDLERS_.showSidebar, args)}
function clearProps(args) {return eventHandler_(EVENT_HANDLERS_.clearProps, args)}

// Private Functions
// =================

// General
// -------

/**
 * All external function calls should call this to ensure standard 
 * processing - logging, errors, etc - is always done.
 *
 * @param {Array} config:
 *   [0] {Function} prefunction
 *   [1] {String} eventName
 *   [2] {String} onErrorMessage
 *   [3] {Function} mainFunction
 *
 * @param {Object}   args       The argument passed to the top-level event handler
 */

function eventHandler_(config, args) {

  try {

    var userEmail = Session.getActiveUser().getEmail()

    Log_ = Utils_.getLogSheet()
    
    log_('Handling ' + config[0] + ' from ' + (userEmail || 'unknown email') + ' (' + SCRIPT_NAME + ' ' + SCRIPT_VERSION + ')')
    
    if (args) {
      CalledFromInstallableTrigger_ = args.triggerUid !== undefined
    }
    
    // Call the main function
    return config[2](args)
    
  } catch (error) {
  
    var assertConfig = {
      error:          error,
      userMessage:    config[1],
//      log:            Log_,
      handleError:    HANDLE_ERROR_, 
      sendErrorEmail: SEND_ERROR_EMAIL_, 
      emailAddress:   userEmail || ADMIN_EMAIL_ADDRESS_,
      scriptName:     SCRIPT_NAME,
      scriptVersion:  SCRIPT_VERSION, 
    }

    Assert.handleError(assertConfig) 
  }
  
} // eventHandler_()

function onOpen() {
  var ui = SpreadsheetApp.getUi()
  ui.createMenu('Photo Manager')
    .addItem('Backup all media to GDrive', 'copyAllMedia')
    .addSeparator()              
    .addItem('Backup media IN an album', 'copyAlbums') 
    .addItem('Backup media NOT IN an album', 'copyMedia')    
    .addSeparator()          
    .addItem('List media not in an Album', 'listMediaNotInAnAlbum')  
    .addSeparator()
    .addItem('Authorize if needed (does nothing if already authorized)', 'showSidebar')      
//    .addItem('Reset Settings', 'clearProps')
    .addToUi()
}

function listMediaNotInAnAlbum_() {Photos_.processMedia(false)}
function copyMedia_()             {Photos_.processMedia(true)}
function copyAlbums_()            {Photos_.copyAlbums()}
function copyAllMedia_()          {copyMedia_(); copyAlbums_()}
// function showSidebar_() {} // TODO - In OAuth2_
// function clearProps_() {} // TODO - In OAuth2_
