// OAuth2
// ======

// functions below adapted from Google OAuth example at https://github.com/googlesamples/apps-script-oauth2

function getMediaService_() {

  const settings = Utils_.getSettings()

  // Create a new service with the given name. The name will be used when
  // persisting the authorized token, so ensure it is unique within the
  // scope of the property store.
  return OAuth2.createService('photos')

      // Set the endpoint URLs, which are the same for all Google services.
      .setAuthorizationBaseUrl('https://accounts.google.com/o/oauth2/auth')
      .setTokenUrl('https://accounts.google.com/o/oauth2/token')

      // Set the client ID and secret, from the Google Developers Console.
      .setClientId(settings.clientId)
      .setClientSecret(settings.clientSecret)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties())

      // Set the scopes to request (space-separated for Google services).
      // see https://developers.google.com/fit/rest/v1/authorization for a list of Google Fit scopes
      .setScope('https://www.googleapis.com/auth/photoslibrary.readonly')

      // Below are Google-specific OAuth2 parameters.

      // Sets the login hint, which will prevent the account chooser screen
      // from being shown to users logged in with multiple accounts.
      .setParam('login_hint', Session.getActiveUser().getEmail())

      // Requests offline access.
      .setParam('access_type', 'offline')

      // Forces the approval prompt every time. This is useful for testing,
      // but not desirable in a production application.
      //.setParam('approval_prompt', 'force')
}

function showSidebar_() {
  var media = getMediaService_()
  const ui = SpreadsheetApp.getUi()
  if (!media.hasAccess()) {
    var authorizationUrl = media.getAuthorizationUrl()
    var template = HtmlService.createTemplate(
        '<a href="<?= authorizationUrl ?>" target="_blank">Authorize</a>. ' +
        'Close this after you have finished.')
    template.authorizationUrl = authorizationUrl
    var page = template.evaluate()
    ui.showSidebar(page)
  } else {
    ui.alert('Script already authorised')
  }
}

function authCallback(request) {
  var media = getMediaService_()
  var isAuthorized = media.handleCallback(request)
  if (isAuthorized) {
    return HtmlService.createHtmlOutput('Success! You can close this tab.')
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab')
  }
}

function clearProps_() {
  const ui = SpreadsheetApp.getUi()
  var response = ui.alert(
    SCRIPT_NAME, 
    'Please confirm you want to reset the script. This will mainly ' + 
      'clear any record of any media that has already been uploaded to GDrive,' + 
      'and require you to re-authorise the script.', 
    ui.ButtonSet.YES_NO)
  if (response === ui.Button.YES) {
    PropertiesService.getUserProperties().deleteAllProperties()
  }
}
