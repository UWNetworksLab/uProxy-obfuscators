
TransformModule = null;  // Global application object.
//var bkg = chrome.extension.getBackgroundPage();
var statusText = 'NO-STATUS';
var packetId = 0;
var testMessage = 'Good 1 2 3 4 5 6 7 8 9 0';

var key;

var IV_SIZE = 8;

// Indicate load success.
function moduleDidLoad() {
  key = new ArrayBuffer(16);
  var uint_view = new Uint32Array(key);
  uint_view[0] = 12345678;
  uint_view[1] = 12345678;    

  var plain_text = str2ab(testMessage);
  var params = {
    command: 'transform',
    id: packetId,
    key: key,
    plain_text: plain_text,
    cipher_text: new ArrayBuffer(plain_text.byteLength + IV_SIZE)
  };
  packetId += 1;
  common.naclModule.postMessage(params);
}

function doRestore(cipher_text) {
  var params = {
    command: 'restore',
    id: packetId,
    key: key,
    plain_text: new ArrayBuffer(cipher_text.byteLength - IV_SIZE),
    cipher_text: cipher_text
  };
  packetId += 1;
  common.naclModule.postMessage(params);
}



// The 'message' event handler.  This handler is fired when the NaCl module
// posts a message to the browser by calling PPB_Messaging.PostMessage()
// (in C) or pp::Instance.PostMessage() (in C++).  This implementation
// simply displays the content of the message in an alert panel.
function handleMessage(message_event) {
  if (typeof message_event.data == typeof {}) {
    console.log('reponse for command:' + message_event.data.command);
    if (message_event.data.hasOwnProperty('plain_text')) {
      console.log('plain_text:' + ab2str(message_event.data.plain_text));
    }
    if (message_event.data.command == 'transform') {
      doRestore(message_event.data.cipher_text);
    }
  } else {
    console.log(message_event.data);
  }
}

// If the page loads before the Native Client module loads, then set the
// status message indicating that the module is still loading.  Otherwise,
// do not change the status message.
function pageDidLoad() {
  if (TransformModule == null) {
	  updateStatus('LOADING...');
  } else {
  	// It's possible that the Native Client module onload event fired
  	// before the page's onload event.  In this case, the status message
  	// will reflect 'SUCCESS', but won't be displayed.  This call will
  	// display the current message.
  	updateStatus();
  }
}

// Set the global status message.  If the element with id 'statusField'
// exists, then set its HTML to the status message as well.
// opt_message The message test.  If this is null or undefined, then
// attempt to set the element with id 'statusField' to the value of
// |statusText|.
function updateStatus(opt_message) {
  if (opt_message)
    statusText = opt_message;
  var statusField = document.getElementById('statusField');
  if (statusField) {
    statusField.innerHTML = statusText;
  }
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

