// view-source:https://andrew.hedges.name/experiments/haversine/ this is where this lat/long distance algorithm was found, (this code is almost identical)

var alphaLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
  a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
  c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // great circle distance in radians
  dm = c * Rm; // great circle distance in miles

  // round the results down to the nearest 1/1000
  mi = round(dm * 10) / 10;
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

// This is used for default start location
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
      // url: "http://localhost:8080/images/superhero.png",
      url: "./images/superhero.png",
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

/**
 * Initializes the map and add's the user's current location.  Loads all tasks for the user 
 * from the database, then adds each one to the map and the list of tasks.
 */
function initMap() {
  // finding streets
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 12,
    center: startLocation
  });
  startingLocation(map);

  // Get the token for the user who is currently logged in
  const token = sessionStorage.getItem("token");
  if (token != null) {
    // Get the name of the user by sending a GET request using the token
    let userReq = new XMLHttpRequest();
    userReq.onreadystatechange = function() {
      if (userReq.readyState == 4) {
        if (userReq.status == 200) {
          console.log("current user");
          console.log(userReq.response);

          // Get locations from database by doing a GET request to /tasks/list
          // Modified from example in the class slides
          let req = new XMLHttpRequest();
          req.onreadystatechange = function() {
            if (req.readyState == 4) {
              if (req.status == 200) {
                let results = JSON.parse(req.response);

                // Calculate the distance away from the user's current location for each task
                results.forEach(task => {
                  var destination = {
                    lat: task.latitude,
                    lng: task.longitude
                  };
                  task.distance = findDistance(startLocation, destination);
                });

                // Sort the tasks based on distance so they can be displayed in order
                results.sort(function(a, b) {
                  return a.distance - b.distance;
                });
                // Testing
                console.log("Task List from Server: " + results);

                // Add each task to the map and list
                for (i in results) {
                  task = results[i];
                  console.log("Task: " + task);
                  var contentString = "<div> " + task.name + " </div>";
                  var infowindow = new google.maps.InfoWindow({
                    content: contentString
                  });
                  var marker = addPinToMap(
                    map,
                    task.latitude,
                    task.longitude,
                    i % alphaLabels.length
                  );
                  marker.myinfowindow = infowindow;
                  marker.addListener("click", function() {
                    this.myinfowindow.open(map, this);
                  });
                  destination = {
                    lat: task.latitude,
                    lng: task.longitude
                  };
                  // task.distance = findDistance(startLocation, destination);

                  // Add the marker to the dictionary so it can be accessed to remove the item from the map
                  markerDict[task.name] = marker;

                  // Add a list item to the task list
                  var ul = document.getElementById("taskList");
                  if (ul != null) {
                    var li = htmlToElement(
                      '<li class="list-group-item"><button onclick="confirmFunction($(this), \'' + task.name + '\')" class="btn btn-dark btn-lg btn-block"><strong>' +
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
          req.open("GET", `/tasks/list/${userReq.response}`, true);
          req.send();
        }
      }
    };
    userReq.open("GET", `/users/${token}`);
    userReq.send();
  } else {
    // If no user is logged in, redirect to the login page
    console.log("No user logged in");
    window.location.assign("login.html");
  }
}

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

/**
 * Adds a pin for a task to the map
 * @param {*} map         map the task should be added to
 * @param {*} latitude    latitude of the address
 * @param {*} longitude   longitude of the address
 * @param {*} i           index used to determine which alpha label to use on the pin
 */
function addPinToMap(map, latitude, longitude, i) {
  var pinLocation = {
    lat: latitude,
    lng: longitude
  };
  var marker = new google.maps.Marker({
    position: pinLocation,
    label: alphaLabels[i],
    map: map
  });
  // console.log(pinLocation);
  return marker;
}

/**
 * Called when the user clicks on a task on the list
 * If the user confirms the task should be removed, delete it from the map and list
 * @param {*} element   HTML task list element
 * @param {*} name      name of the task (used to remove it from the map and database)
 */
function confirmFunction(element, name) {
  console.log(element);
  console.log(name);
  if (confirm(`You are removing ${name} from To-Do list.`)) {
    // Remove the marker for the task from the map
    // Found how to remove from the map here:
    // https://developers-dot-devsite-v2-prod.appspot.com/maps/documentation/javascript/examples/marker-remove
    markerDict[name].setMap(null);     

    // Delete the task from the dictionary of current markers
    // Found how to delete the item here:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete
    delete markerDict[name]; 

    // Remove the task from the database by sending a DELETE request
    let req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState == 4) {
        if (req.status == 200) {
          console.log(req.response);
        }
      }
    };
    req.open("DELETE", `/tasks/task/${name}`);
    req.send();

    // Remove the item from the task list
    // Found how to access the parent item here: https://developer.mozilla.org/en-US/docs/Web/API/Node/parentElement
    var ul = document.getElementById("taskList");
    ul.removeChild(element[0].parentElement);   
  } else {
    // do nothing
  }
}

// If the user clicks the log out button, call the logOut() function
$("#logOutButton").on("click", logOut);

// If the user clicks the log out menu option, call the logOut() function
$("#logOutMenu").on("click", logOut);

/**
 * Logs out a user by sending a DELETE request to remove the user's token from the database
 * and clearing the session storage to remove the token. Then redirects to the login page
 */
function logOut() {
  console.log("Logout button clicked");
  let req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4) {
      if (req.status == 200) {
        sessionStorage.clear();
        window.location.assign("login.html");
      }
    }
  };
  req.open("DELETE", "/users/logout");
  req.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
  req.send(JSON.stringify({ token: sessionStorage.getItem("token") }));
}