
// view-source:https://andrew.hedges.name/experiments/haversine/ this is where this lat/long distance algorithm was found, (this code is almost identical)

var alphaLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
var Rm = 3961; // mean radius of the earth (miles) at 39 degrees from the equator

/* main function */
function findDistance(origin, destination) {
  var t1, n1, t2, n2, lat1, lon1, lat2, lon2, dlat, dlon, a, c, dm, dk, mi;

  // get values for lat1, lon1, lat2, and lon2
  t1 = origin.lat;
  n1 = origin.lng;
  t2 = destination.lat;
  n2 = destination.lng;

  // convert coordinates to radians
  lat1 = deg2rad(t1);
  lon1 = deg2rad(n1);
  lat2 = deg2rad(t2);
  lon2 = deg2rad(n2);

  // find the differences between the coordinates
  dlat = lat2 - lat1;
  dlon = lon2 - lon1;

  // how to find distance with lat/longitude
  a = Math.pow(Math.sin(dlat / 2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // great circle distance in radians
  dm = c * Rm; // great circle distance in miles

  // round the results down to the nearest 1/1000
  mi = round(dm * 10)/10;
  var fixed = mi.toFixed(1);

  return fixed;
}

// convert degrees to radians
function deg2rad(deg) {
  rad = (deg * Math.PI) / 180; // radians = degrees * pi/180
  return rad;
}

// round to the nearest 1/1000
function round(x) {
  return Math.round(x * 1000) / 1000;
}

var map = null;
var geocoder = null;
// // This is used for default start location
var startLocation = {
  lat: 45.5051,
  lng: -122.675
};

// Dictionary to track markers on the map - keys are names of tasks, values are markers
var markerDict = {};

/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
  var template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}
// // function findingDistance(origin, destination) {
// //   // finding distance
// //   var service = new google.maps.DistanceMatrixService();
// //   var origin = location;
// //   var destination = (0, 0);
// // }
//
function startingLocation(map) {
  var iconBase = "http://localhost:8080/images/";
  var icons = {
    start: {
      //icon: iconBase + 'superhero.png'
      url: "http://localhost:8080/images/superhero.png",
      scaledSize: new google.maps.Size(50, 50) // scaled size
    }
  };
  var marker = new google.maps.Marker({
    position: startLocation,
    icon: icons.start,
    map: map
  });
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      startLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      // I utilized this to set starting location:  https://developers.google.com/maps/documentation/javascript/geolocation
      map.setCenter(startLocation);
      marker.setPosition(startLocation);
      // origin = startLocal;
      //infoWindow.setPosition(pos);
      //  infoWindow.setContent('Location found.');
      //  infoWindow.open(map);
      //  map.setCenter(pos);
    });
  }
}

function initMap() {
  // finding streets
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: startLocation
  });
  startingLocation(map);

  // Get locations from database by doing a GET request to /newItem/list
  // Modified from example in the class slides
  let req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4) {
      if (req.status == 200) {
        let results = JSON.parse(req.response);

        results.forEach(task => {
          var destination = {
            lat: task.latitude,
            lng: task.longitude
          };
          task.distance = findDistance(startLocation, destination);
        });
        results.sort(function (a, b) {
         return a.distance - b.distance;
         });
        // Testing
        console.log("Task List from Server: " + results);
        for (i in results) {
          task = results[i];
          console.log("Task: " + task);

          var marker = addPinToMap(map, task.latitude, task.longitude, i % alphaLabels.length);
          destination = {
            lat: task.latitude,
            lng: task.longitude
          };
          // task.distance = findDistance(startLocation, destination);
          markerDict[task.name] = marker;
          var ul = document.getElementById("taskList");
          if (ul != null) {
            var li = htmlToElement(
              '<li class="list-group-item"><button onclick="confirmFunction($(this))" class="btn btn-secondary btn-lg btn-block"><strong>' +
                alphaLabels[i % alphaLabels.length] + ". " +
                task.name +
                "</strong><br> " +
                task.distance +
                " miles </button></li>"
            );
            ul.appendChild(li);
          }
        }
      }
    }
  };
  req.open("GET", "/newItem/list", true);
  req.send();
}
// codeAddress("3606 N.E. 43rd Ave Portland, OR 97213");



function codeAddress(address) {
  geocoder.geocode(
    {
      address: address
    },
    function(results, status) {
      if (status == "OK") {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
        });
      } else {
        alert("Geocode was not successful for the following reason: " + status);
      }
    }
  );
}

function addPinToMap(map, latitude, longitude, i) {
  var pinLocation = {
    lat: latitude,
    lng: longitude
  };
  // TODO: need to call the locations from the DB
  var marker = new google.maps.Marker({
    position: pinLocation,
    label: alphaLabels[i],
    map: map
  });
  console.log(pinLocation);
  return marker;
}


function confirmFunction(element) {
  // Get the name of the task
  var text = element[0].textContent;
  var name = text.split("Distance")[0];
  // Remove the letter label from the name
  name = name.substring(3, name.length);
  if (confirm(`You are removing ${name} from To-Do list.`)) {
    // Remove the marker for the task from the map
    markerDict[name].setMap(null); // https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/javascript/examples/marker-remove
    delete markerDict[name]; // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete

    // Remove the task from the database
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        if (req.status == 200) {
          console.log(req.response);
        }
      }
    };
    req.open("DELETE", `/newItem/task/${name}`);
    req.send();

    // Remove the item from the task list
    var ul = document.getElementById("taskList");
    ul.removeChild(element[0].parentElement); //https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement
  } else {
    // do nothing
  }
}
