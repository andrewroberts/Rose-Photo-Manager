// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// Tests.gs
// ========
//
// Dev: AndrewRoberts.net
//
// Code for internal/unit testing

function test_init() {
  Log_ = Utils_.getLogSheet()
}

function test_misc() {
  // ...
}

function test_() {
  test_init()
  // ...
}

function test_listFolders() {

  var a = DriveApp.getFolderById('').getFiles()
  
  while (a.hasNext()) {
    var b = a.next()
    var c = b.getName()
    var d = b.getMimeType()
  }
  
  debugger

//  var a = SpreadsheetApp.getActive()
//  debugger
//
//  initPhotosManager_()
//
//  var root = DriveApp.getFolderById(GDRIVE_ROOT_FOLDER_ID_)
//  var folders = getFolderList_(root)
//  
//  var albumTitles = getAlbumTitles_()
//  
//  for (var title in albumTitles) {
//    if (!albumTitles.hasOwnProperty(title)) continue
//    if (folders[title] === undefined) {
//      log_('There is no GDrive folder called "' + title + '"')
//    }
//  }
//
//  return 
}
