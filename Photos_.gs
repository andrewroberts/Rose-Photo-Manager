// 34567890123456789012345678901234567890123456789012345678901234567890123456789

// JSHint - TODO
/* jshint asi: true */

(function() {"use strict"})()

// Photos_.gs
// ===========
//
// Manage the ID list of media already backed up
//
// Derived and inspired by https://ithoughthecamewithyou.com/post/how-to-backup-google-photos-to-google-drive-automatically-after-july-2019-with-apps-script
//
// Dev: andrewroberts.net

function test_Photos() {
  test_init()
  Photos_.copyAlbums()
  debugger
}

const Photos_ = (function(ns) {

  /**
   * 
   */

  ns.processMedia = function(doCopy = true) {

    initPhotosManager_()
    log_('START: Process media files not in an album')
    
    let rawMediaInAlbums = Photos_.getMediaThatIsInAnAlbum()
    if (!rawMediaInAlbums) return

    let mediaInAlbums = rawMediaInAlbums.mediaInAlbums 
    if (!mediaInAlbums) return

    var allMedia = Photos_.getAllMedia()
    checkForDuplicates()
    log_('END: Finished Process media files not in an album')
    return
    
    // Private Functions
    // -----------------
    
    /**
     * Check for media that is not in an album by comparing the 
     * list in an album - mediaInAlbums - with the list of all
     * media - allMedia
     */
    
    function checkForDuplicates() {
      log_('Checking for media that is not in both lists')
      log_('Media in an album: ' + Object.keys(mediaInAlbums).length)
      log_('All media: ' + Object.keys(allMedia).length)
      var folder = getBackupFolder()
      let backupList = BackupList_.get()
      for (var id in allMedia) {
        if (!(id in allMedia)) continue
        var media = allMedia[id]
        if (!mediaInAlbums[id]) {
          logLink_(media.baseUrl, media.filename + ' is not in an album')
          if (doCopy) {
            const fileData = BackupList_.getValue(backupList, id)
            if (!fileData) {
              const fileId = copyMediaToGDrive(media.downloadUrl, folder, media.filename)
              const fileData = {
                name: media.filename,
                fileId: fileId
              }
              BackupList_.setValue(backupList, id, fileData)
              BackupList_.store(backupList)
            }
          }
        }
      }
      return
      
      // Private Functions
      // -----------------
      
      function copyMediaToGDrive(url, folder, filename) {
        var response = UrlFetchApp.fetch(url, {
          headers: {
            Authorization: `Bearer ${Utils_.getAccessToken()}`
          }
        })
        let fileId = null
        if (isTooBig(response)) {      
          log_('Cannot download ' + filename + ' as it is too large.')
        } else {
          var blob = response.getBlob()
          blob.setName(filename)
          fileId = folder.createFile(blob).getId()
          log_('Downloaded "' + filename + '" to GDrive')
        }
        return fileId
      }
    }
    
  } // Photos_.processMedia()
  
  ns.copyAlbums = function() {

    initPhotosManager_()  
    log_('START: Copy album contents from ' + Settings_.startDate)
    var albums = Photos_.getMediaThatIsInAnAlbum()
    if (!albums) return
    albums = albums.mediaByAlbum
    copyAlbumMediaToGDrive(albums)
    log_('END: Copied album contents from ' + Settings_.startDate) 
    return
    
    // Private Functions
    // -----------------
    
    function copyAlbumMediaToGDrive(albums) {
    
      log_('Copying the album media to GDrive')
      
      var root = DriveApp.getFolderById(Settings_.rootFolder)
      var backupFolder = getBackupFolder()
      var alerts = []    
      var backupList = BackupList_.get()
      var folders = getFolderList_(root)
      
      for (var albumId in albums) {
      
        if (!(albumId in albums)) continue
        var album = albums[albumId]
        
        if (album.media.length === 0) {
          // log_(album.name + ' - Ignoring - no new media.')
          continue
        }
        
        processAlbums()
      }
      
      sendAlertNotification()
      return
      
      // Private Functions
      // -----------------

      function processAlbums() {

        var albumFolder = getAlbumFolder()
        var doneBackups = false

        album.media.forEach(function(item) {
        
          var fileData = BackupList_.getValue(backupList, item.id) 
      
          if (fileData === undefined) {
            downloadMedia(fileData, item) 
          } else {
          
            // Is this file already stored for this album, or is this the file 
            // stored in another album, in which case we just create a shortcut
            if (fileData.albumId === albumId) {
              return
            } else {          
              if (!alreadyCreatedShortcut()) {
                if (!fileData.fileId) {
                  log_('WARNING! No file ID for "' + fileData.name + '" when trying to create shortcut')
                } else {
                  // The file data is stored, but check that it still exists 
                  // before trying to create the shortcut
                  try {
                    DriveApp.getFileById(fileData.fileId)
                    albumFolder.createShortcut(fileData.fileId)
                  } catch (error) {
                    BackupList_.removeKeyUsingName(fileData.name)
                    log_(`WARNING: "${fileData.name} data was stored, but it had been deleted. It has now been removed from storage.`)
                  }
                }
              }
            }
          }
          
          // Private Functions
          // -----------------

          function alreadyCreatedShortcut() {
            var files = albumFolder.getFilesByName(fileData.name)
            var found = false
            while (files.hasNext()) {
              if (files.next().getMimeType() === 'application/vnd.google-apps.shortcut') {
                found = true
              }
            }
            return found
          }        
        })
        
        if (!doneBackups) // log_(album.name + ' - Ignoring - All files already backed up.')
        return 
        
        // Private Functions
        // -----------------

        function downloadMedia(fileData, item) {
          
          doneBackups = true
          
          var filename = getFilename(item.filename, albumFolder)
          logLink_(
            item.baseUrl, 
            'Downloading ' + album.name + ' - ' + filename + ' ' + 
              '(' + item.id + ') to album ' + albumFolder.getName())
          
          var response = UrlFetchApp.fetch(item.downloadUrl, {
            headers: {
              Authorization: `Bearer ${Utils_.getAccessToken()}`
            }
          })
          
          if (isTooBig(response)) {      
            alerts.push('Cannot download ' + filename + ' as it is too large.')
            return
          }
          
          var blob = response.getBlob()
          blob.setName(filename)
          var file = albumFolder.createFile(blob)
          
          var fileData = {
            name: filename,
            albumId: albumId,
            fileId: file.getId()
          }
          
          BackupList_.setValue(backupList, item.id, fileData)
          BackupList_.store(backupList)
          
        } // copyAlbums.copyAlbumMediaToGDrive.processAlbums.downloadMedia()

        /**
         * If there is already a GDrive folder with the same name as the album
         * use that, otherwise create a new folder in the GDrive "backup folder"
         * from where it can be categorised manually
         */
        
        function getAlbumFolder() {
        
          var folderId = folders[album.name]
          var albumFolder
          
          if (folderId) {
            albumFolder = DriveApp.getFolderById(folderId)
          } else {
            albumFolder = backupFolder.createFolder(album.name)
            log_('Created "' + album.name + '"')
          }
        
          return albumFolder
        }
        
      } // copyAlbums.copyAlbumMediaToGDrive.processAlbums()
      
      function sendAlertNotification() {
        if (alerts.length > 0) {
          MailApp.sendEmail(
            Session.getEffectiveUser().getEmail(), 
            'Google Photos Backup large file failures on ' + new Date(), 
            alerts.join('\r\n')) 
        }
      }
      
    } // copyAlbums.copyAlbumMediaToGDrive()
    
  } // Photos_.copyAlbums()

  ns.getAllMedia = function() {

    initPhotosManager_()
    log_('Getting a list of all the media, regardless of whether they are in an album')
    var nextPageToken = null
    var media = {}
    const startDate = Settings_.startDate
    
    // Up to 10 000 images and videos
    for (var page = 1; page <= 1000; page++) {
      
      var options = {
        headers: {
          Authorization: `Bearer ${Utils_.getAccessToken()}`
        },
        'contentType' : 'application/json',
        muteHttpExceptions: true
      }
      
      var url = MEDIA_URL_ + '?pageSize=100'

      if (nextPageToken != null) {
        url += "&pageToken=" + nextPageToken
      }

      var response = UrlFetchApp.fetch(url, options)
      var content = response.getContentText()
      
      if (response.getResponseCode() !== 200) {
        log_(content)
        throw content
      }
      
      var json = JSON.parse(content) 
      
      if ('mediaItems' in json) {
        json.mediaItems.forEach(function(mediaItem) {
          var data = getPhotoData(mediaItem, startDate)
          if (data) {
            media[data.id] = {
              created     : data.created,
              baseUrl     : data.baseUrl,
              downloadUrl : data.downloadUrl,
              filename    : data.filename
            }
          }
        })
      }
      
      if ('nextPageToken' in json) {
        nextPageToken = json.nextPageToken
      } else {
        break
      }
      
    } // for each page
    
    return media
    
  } // getAllMedia

  ns.getMediaThatIsInAnAlbum = function(checkWithUser) {
    
    if (checkWithUser === undefined && TEST_CHECK_WITH_USER_) checkWithUser = true
    initPhotosManager_()
    const startDate = Settings_.startDate

    if (checkWithUser) {
      if (!continueDialog()) return null
    }

    var mediaInAlbums = {}
    var rawAlbums = getRawAlbumData_()  
    var albums = addMediaToAlbum()
    
    return {
      mediaInAlbums: mediaInAlbums,
      mediaByAlbum: albums
    }
    
    // Private Functions
    // -----------------

    function continueDialog() {
      return true // TODO
      if (!SpreadsheetApp.getActive()) return true
      if (CalledFromInstallableTrigger_) return true      
      var ui = SpreadsheetApp.getUi()
      var response = ui.alert(
        'Google Photos Manager', 
        'Do you want to continue with the backup/listing of media newer than ' + 
          Settings_.startDate, 
        ui.ButtonSet.YES_NO)
      return (response === ui.Button.YES)
    }

    function addMediaToAlbum() {
    
      log_('Adding media to the album list')
      var albums = {}
      
      rawAlbums.forEach(function(rawAlbum) {
        albums[rawAlbum.id] = {
          name  : rawAlbum.title,
          media : getMediaInAnAlbum(rawAlbum.id),
          id    : rawAlbum.id
        }
      })
      
      return albums
      
      // Private Functions
      // -----------------

      function getMediaInAnAlbum(albumId) {
      
        var nextPageToken = null
        var mediaInThisAlbum = []
      
        // Up to 10 000 images and videos
        for (var page = 1; page <= 1000; page++) {
        
          var request = {
            "pageSize":"100",
            "albumId": albumId
          }
          
          if (nextPageToken != null) {
            request["pageToken"] = nextPageToken
          }
                
          var options = {
            headers: {
              Authorization: `Bearer ${Utils_.getAccessToken()}`
            },
            'method' : 'post',
            'contentType' : 'application/json',
            'payload' : JSON.stringify(request, null, 2),
            muteHttpExceptions: true
          }
          
          var response = UrlFetchApp.fetch(MEDIA_SEARCH_URL_, options)
          var content = response.getContentText()
          
          if (response.getResponseCode() !== 200) {
            log_(content)
            throw content
          }
          
          var json = JSON.parse(content) 
          
          if ('mediaItems' in json) {
            json.mediaItems.forEach(function(mediaItem) {
              var data = getPhotoData(mediaItem, startDate)
              if (!data) return
              mediaInThisAlbum.push(data)
              if (mediaInAlbums[data.id]) return
              mediaInAlbums[data.id] = {
                albumId     : albumId,
                baseUrl     : data.baseUrl,
                downloadUrl : data.downloadUrl,
                created     : data.created,
                filename    : data.filename
              }
            })
          }
          
          if ('nextPageToken' in json) {
            nextPageToken = json.nextPageToken
          } else {
            break
          }
          
        } // for each page
      
        return mediaInThisAlbum
        
      } // getMediaThatIsInAnAlbum.addMediaToAlbum.getMediaInAnAlbum()
    
    } // getMediaThatIsInAnAlbum.addMediaToAlbum()

  } // getMediaThatIsInAnAlbum()

  return ns
  
  // Private Functions
  // -----------------

  function getPhotoData(mediaItem, startDate) {
    
    var metadata = mediaItem.mediaMetadata
    var created = new Date(metadata.creationTime)
    if (created < startDate) return null
    var baseUrl = mediaItem.baseUrl 
    
    // if the photo property exists it's a photo and use =d to download, otherwise 
    // a video and we need to use =dv
    var downloadUrl = mediaItem.baseUrl   
    downloadUrl += ('photo' in metadata) ? '=d' : '=dv'
    
    return {
      id          : mediaItem.id,
      filename    : mediaItem.filename,
      baseUrl     : baseUrl,
      downloadUrl : downloadUrl,
      created     : created
    }
  }

  // Private Helper Functions
  // ------------------------

  function  getFilename(filename, albumFolder) {
    while (true) {
      var files = albumFolder.getFilesByName(filename)
      if (!files.hasNext()) {
        break
      }
      // duplicate... keep adding (1) to the end until it isn't any more 
      filename = '(1)' + filename
    }
    return filename
  }

  function isTooBig(response) {
    var responseHeaders = response.getHeaders()
    var contentLength = responseHeaders['Content-Length']
    return contentLength >= MAX_FILE_SIZE_
  }

  function logLink_(url, message) {
    if (url && message) {
      log_('=HYPERLINK("' + url + '", "' + message + '")')
    } else {
      log_('Error in logLink_. url: "' + url + '", "' + message + '"')
    }
  }

  function initPhotosManager_() {
    if (!Service_)  Service_  = getMediaService_()
    if (!Log_)      Log_      = Utils_.getLogSheet()
    if (!Settings_) {
      Settings_ = Utils_.getSettings()
      if (!Settings_.rootFolder) throw new Error('Please enter the root folder ID to the Settings tab')
      if (!Settings_.startDate) throw new Error('Please enter the date from which you would like to upload media in the Settings tab')
    }
  }

  function getFolderList_(source, list) {

    initPhotosManager_()
    
    if (!TEST_GET_FOLDER_LIST_) {
      log_('!!! WARNING: Not getting real folder list !!!')
      return {
        Test1: '1fNp43KL5GBctEFO_uUEzHbhJgmAxJaW-',
        Test2: '1RpEN39VJfU0y4TJNffUEt9by0Jqordk0'
      }
    }
    
    if (!list) list = {}
    
    var folders = source.getFolders()
    
    while(folders.hasNext()) {
      var subFolder = folders.next()
      var subFolderName = subFolder.getName()
      if (list[subFolderName] !== undefined) {
        throw new Error('There are multiple folders in the GDrive with the name "' + subFolderName + '"')
      }
      list[subFolderName] = subFolder.getId()
      getFolderList_(subFolder, list)
    }
    
    return list
  }

  function getRawAlbumData_() {
    
    initPhotosManager_()
    var nextPageToken = null
    var albums = []
    
    if (!TEST_GET_RAW_ALBUMS_) {
      log_('!!! WARNING: Not getting real raw date !!!')
      return [TEST1_ALBUM_, TEST2_ALBUM_]
    }
    
    log_('Getting raw album data')
    
    // Up to 5 000 albums
    for (var page = 1; page <= 100; page++) {
      
      var options = {
        headers: {
          Authorization: `Bearer ${Utils_.getAccessToken()}`
        },
        'contentType' : 'application/json',
        muteHttpExceptions: true
      }
      
      var url = ALBUMS_URL_ + '?pageSize=50'
      
      if (nextPageToken != null) {
        url += "&pageToken=" + nextPageToken
      }
      
      var response = UrlFetchApp.fetch(url, options)
      var content = response.getContentText()
      
      if (response.getResponseCode() !== 200) {
        log_(content)
        throw content
      }
      
      var json = JSON.parse(content)
      
      if ('albums' in json) {
        json.albums.forEach(function(album) {albums.push(album)})
      }
      
      if ('nextPageToken' in json) {
        nextPageToken = json.nextPageToken
      } else {
        break
      }
      
    } // for each page of albums
    
    return albums 
    
  } // getRawAlbumData_()

  function getAlbumTitles_() {
    var albumTitles = {}
    getRawAlbumData_().forEach(function(rawAlbum) {
      albumTitles[rawAlbum.title] = true
    })
    return albumTitles
  }

  function getBackupFolder() {
    let folder
    const root = DriveApp.getFolderById(Settings_.rootFolder)
    let folders = root.getFoldersByName(SCRIPT_NAME)
    if (folders.hasNext()) {
      folder = folders.next()
      if (folders.hasNext()) {
        throw new Error('Multiple folder called "' + SCRIPT_NAME + '" in the root photos folder')
      }
    } else {
      folder = root.createFolder(SCRIPT_NAME)
    }
    return folder
  }
  
})({})
