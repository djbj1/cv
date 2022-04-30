let data;
let lastelement = 0;

let albumTrackCounter = 0;
let albumTrackCount = 0;

// Dokument geladen
$(document).ready(function () {
  $.ajax({
    type: "GET",
    url: "conf.csv",
    dataType: "text",
    success: function (data) {
      processData(data);
    },
  });
});

function processData(csvContent) {
  // CSV- Daten einlesen
  data = csvToArray(csvContent);
  //  alert(JSON.stringify(data));
  // console.log(data);

  //Alben- Anzeige auf Webseite generieren
  for (let index = 0; index < data.length; index++) {
    if (index > 0) {
      // Auf Album prüfen
      if (
        data[index - 1].album != data[index].album ||
        data[index].album == ""
      ) {
        let myDiv = document.getElementById("0");
        let divClone = myDiv.cloneNode(true); // the true is for deep cloning
        divClone.id = index; // dem neuen Div eine ID zuweisen.
        //document.body.appendChild(divClone);
        document.getElementById("list_container").appendChild(divClone);

        divClone.class = "song";
        console.log(divClone.class);
      }
    }

    $("#" + index + " img").attr("src", "img/" + data[index].logofile);
    $("#" + index + " h3").html(data[index].text1);
    $("#" + index + " p").html(data[index].text2);
  }

  // Mousup Event anmelden, wenn alle Daten aus CSV geladen wurden.

  $(".song").mouseup(function () {
    let element = this.id * 1;
    console.log(element);

    if (element >= 0) {
      // auf Album mit prüfen und Tracks einbinden
      albumTrackCounter = 0;
      albumTrackCount = 0;
      if (data[element].album != "") {
        let i = 0;
        do {
          //Wenn letztes Element eines Albums erreicht ist, soll die Suche abgebrochen werden.
          //Da die Anzahl der Tracks aber nicht vorher bekannt ist, wird hier auf try and error geprüft.
          try {
            if (data[element + i + 1].album !== undefined) {
              i += 1;
            }
          } catch {
            break;
          }
        } while (data[element].album == data[element + i].album);
        
        console.log("Album: " + data[element].album + " tracks: " + i);
        albumTrackCounter = 1;
        albumTrackCount = i;
      }

      // Player vorbereiten + starten
      $("#player").attr("src", data[element].source);
      let x = document.getElementById("player");
      $("#divPlayerTitle h3").text(
        data[element].text1 + " - " + data[element].text2
      );

      x.play();
      $("#" + lastelement).css("background-color", "");
      $("#" + element).css("background-color", "rgba(104, 255, 94, 0.75)");

      lastelement = element;
    }
  });
}

function csvToArray(str, delimiter = ",") {
  // slice from start of text to the first \n index
  // use split to create an array from string by delimiter

  //const headers = str.slice(0, str.indexOf("\n")).split(delimiter);  //DEAKTIVIERT, weil fehlerhaft.

  /* -1 eingefügt, damit der Zeilenumbruch nicht in der Überschrift
  verwendet WritableStreamDefaultController.*/
  const headers = str.slice(0, str.indexOf("\n") - 1).split(delimiter);

  // slice from \n index + 1 to the end of the text
  // use split to create an array of each csv value row
  const rows = str.slice(str.indexOf("\n") + 1).split("\n");

  // wenn letzte Zeile keinen Ihnalt, dann löschen.

  if (rows[rows.length - 1] == "") {
    rows.length = rows.length - 1;
  }

  // Map the rows
  // split values from each row into an array
  // use headers.reduce to create an object
  // object properties derived from headers:values
  // the object passed as an element of the array
  const arr = rows.map(function (row) {
    let values = row.slice(0, row.length - 1);
    values = values.split(delimiter);
    const el = headers.reduce(function (object, header, index) {
      object[header] = values[index];
      return object;
    }, {});
    return el;
  });

  // return the array
  return arr;
}

// Player (by CodeProject)

//JS part
var audio_info = document.getElementById("player");
audio_info.addEventListener(
  "playing",
  function (e) {
    console.log("Audio playback has started ...");
    console.log("Playback started at : " + e.target.currentTime + " seconds");
  },
  false
);
audio_info.addEventListener(
  "pause",
  function (e) {
    console.log("Audio playback has been paused ...");
    console.log("Playback paused at : " + e.target.currentTime + " seconds");
  },
  false
);

audio_info.addEventListener(
  "ended",
  function (e) {
    console.log("Playback has ended");
    // Start the player wenn Albumtracks
    console;

    if (albumTrackCount > 0 && albumTrackCounter < albumTrackCount) {
      $("#divPlayerTitle h3").text(
        data[lastelement].text1 +
          " - " +
          data[lastelement + albumTrackCounter].text2
      );

      audio_info.src = data[lastelement + albumTrackCounter].source;
      audio_info.play();
      albumTrackCounter += 1;
    } else if (albumTrackCount > 0 && albumTrackCounter >= albumTrackCount) {
      audio_info.src = "";
      albumTrackCounter = 0;
    }
  },
  false
);
audio_info.addEventListener(
  "volumechange",
  function (e) {
    console.log("Volume has changed ...");
    console.log("Volume is now " + e.target.volume);
  },
  false
);

var files = ["/sound/falsch.wav", "/sound/richtig.wav", "/sound/zip.wav"];

// === Playlist

function Playlist() {
  // Playlist array
  var files = ["/sound/falsch.wav", "/sound/richtig.wav", "/sound/zip.wav"];

  // Current index of the files array
  var i = 0;

  // Get the audio element
  // var music_player = document.querySelector("#music_list audio");
  var music_player = document.getElementById("player");

  // function for moving to next audio file
  function next() {
    // Check for last audio file in the playlist
    if (i === files.length - 1) {
      i = 0;
    } else {
      i++;
    }

    // Change the audio element source
    music_player.src = files[i];
  }

  // Check if the player is selected
  if (music_player === null) {
    throw "Playlist Player does not exists ...";
  } else {
    // Start the player
    music_player.src = files[i];

    // Listen for the music ended event, to play the next audio file
    music_player.addEventListener("ended", next, false);
  }
}
