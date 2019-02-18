// Original Framework came from https://github.com/solid/profile-viewer-tutorial

$('#divfilelist').hide();

// Log the user in and out on click
const popupUri = 'popup.html';
$('#login  button').click(() => solid.auth.popupLogin({ popupUri }));
$('#logout button').click(() => solid.auth.logout());

// Update components to match the user's login status
solid.auth.trackSession(session => {
  const loggedIn = !!session;
  $('#login').toggle(!loggedIn);
  $('#logout').toggle(loggedIn);
  if (loggedIn) {
    $('#user').text(session.webId);
  }
});

var oFileData = [];
$('#getlist').click(async function loadProfile() {
  // Set up a local data store and associated data fetcher
  const store = $rdf.graph();
  const fetcher = new $rdf.Fetcher(store);

  // Load the data into the store
  const dataFileURL = $('#datafileurl').val();
  fetcher.nowOrWhenFetched(dataFileURL, function(ok, body, xhr) {
    if (!ok) {
        alert("Oops, something happened and couldn't fetch data");
    } else {
	// Copyright (c) 2019 FormRouter, Inc. <www.formrouter.com>
	// Copyright (c) 2019 David Conorozzo <dave.conorozzo@formrouter.com>
        // do something with the data in the store
        var so = store.statementsMatching(undefined, undefined, undefined);
        if(!so || so.length == 0) {
          alert("Retrieved file but no data found");
        }
        oFileData = [];
        var oFileNames = [];
        var o = null;
        var t = null;
        for (var i=0; i<so.length;i++) {
            o = so[i];
            if(o && o.object && o.object.datatype && o.object.datatype.value && o.object.datatype.value == "http://www.w3.org/2001/XMLSchema#hexBinary") {
              if(o.object.value.length > 0) {
                // FormRouter file attachments generate a field with the same name as the attachment BLOB with the prefix _OriginalFileName so that we know what the submitted filename and extension was
                t = new $rdf.NamedNode(o.predicate.value + "_OriginalFileName");
                var sFileName = store.anyValue(o.subject,t,undefined);
                if(sFileName && sFileName.length > 0) {
                  oFileData[oFileData.length] = o.object.value;
                  oFileNames[oFileNames.length] = sFileName;
                }
                else { // No filename found
                  oFileData[oFileData.length] = o.object.value;
                  oFileNames[oFileNames.length] = "Unknown from: " + o.predicate.value;
                }
              }
            }
        } // end for

        // Clear dropdown
	   $('#ddFileList').empty();
        // Populate dropdown
        var ddFileList = $('#ddFileList')[0];
        for(var i=0;i<oFileNames.length;i++) {
          ddFileList.options[ddFileList.options.length] = new Option(oFileNames[i], i.toString());
        }

        // Show dropdown div
        if(oFileNames.length > 0) {
          $('#divfilelist').show();
        }
        else {
          $('#divfilelist').hide();
          alert("There were no files in that data.");
        }
    } 
  });

});

$('#getSelectedFile').click(function saveFileOut() {
  var i = $('#ddFileList')[0].selectedIndex;
  if(i > -1) {
    downloadBinaryFile($('#ddFileList :selected').text(), oFileData[parseInt($('#ddFileList').val())]);
  }
  else {
    alert("You must populate the list first by entering a URL and retieving the data.");
  }
});

function downloadBinaryFile(filename, hexContent) {
    var pom = document.createElement('a');
    var binContent = btoa(String.fromCharCode.apply(null, hexContent.match(/\w{2}/g).map(function (a) { return parseInt(a, 16) })));
    pom.setAttribute('href', 'data:application\/octet-stream;base64,' + binContent);
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}
