// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// Code review all files - TODO
// JSHint review (see files) - TODO
// Unit Tests - TODO
// System Test (Dev) - TODO
// System Test (Prod) - TODO

// Config.gs
// =========
//
// Dev: AndrewRoberts.net
//
// All the constants and configuration settings

// Configuration
// =============

var SCRIPT_NAME = "Rose Photo Manager"
var SCRIPT_VERSION = "v0.dev"

var PRODUCTION_VERSION_ = false

// Assert library
// --------------

var SEND_ERROR_EMAIL_ = PRODUCTION_VERSION_ ? true : false
var HANDLE_ERROR_ = PRODUCTION_VERSION_ ? Assert.HandleError.DISPLAY_FULL : Assert.HandleError.THROW
var ADMIN_EMAIL_ADDRESS_ = ''

// Tests
// -----

var TEST_GET_RAW_ALBUMS_ = true
var TEST_CHECK_WITH_USER_ = true
var TEST_GET_FOLDER_LIST_ = true

var TEST1_ALBUM_ = {
  id: "ALtE6xylpqpWzlec1az4kTFygu1wtR5VamL5um9JY9Mk6v9Wlbc0q4pv_0xw3fjILC9E7cxYVQXH",
  title: "Test1",
  productUrl: "https://photos.google.com/lr/album/ALtE6xylpqpWzlec1az4kTFygu1wtR5VamL5um9JY9Mk6v9Wlbc0q4pv_0xw3fjILC9E7cxYVQXH",
  mediaItemsCount: 2
}

var TEST2_ALBUM_ = {
  id: "ALtE6xxJxBCeQlVBgxqsirgHq8Mxs2hOGrU3STnc_mKQigCRN-4P3zDlmb6VuWiK1RSLGO75CwlD",
  title: "Test2",
  productUrl: "https://photos.google.com/lr/album/ALtE6xxJxBCeQlVBgxqsirgHq8Mxs2hOGrU3STnc_mKQigCRN-4P3zDlmb6VuWiK1RSLGO75CwlD",
  mediaItemsCount: 2
}

var TEST_FLAG_ = true

var TEST_SHEET_ID_ = ''

if (PRODUCTION_VERSION_) {
  if (!TEST_FLAG_) {
    throw new Error('Test Flag set in production')
  }
}

// Photos API
// ----------

var BASE_URL_ = 'https://photoslibrary.googleapis.com/v1/'
var MEDIA_URL_ = BASE_URL_ + 'mediaItems'
var MEDIA_SEARCH_URL_ = BASE_URL_ + 'mediaItems:search'
var ALBUMS_URL_ = BASE_URL_ + 'albums'

// Constants/Enums
// ===============

var BACKUP_LIST_NAME_ = 'PhotosManager_BackupList'

const MAX_FILE_SIZE_ = 50000




