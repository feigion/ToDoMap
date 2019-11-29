var map = null;

/*
var test_data = [
  {
    text: "first item",
    location: {
      address: "123 Sesame St",
      longitude: 45.51,
      latitude: -122.7
    }
  },
  {
    text: "Second item",
    location: {
      address: "456 None St",
      longitude: 45.41,
      latitude: -122.22
    }
  },
  {
    text: "Third item",
    location: {
      address: "777 me St",
      longitude: 45.43,
      latitude: -122.23
    }
  },
  {
    text: "Fourth item",
    location: {
      address: "987 abc St",
      longitude: 45.61,
      latitude: -122.2
    }
  }
];
*/

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

function initMap() {
  var location = {
    lat: 45.5051,
    lng: -122.675
  };
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: location
  });
  var iconBase = "http://localhost:8080/images/";
  var icons = {
    start: {
      //icon: iconBase + 'superhero.png'
      url: "http://localhost:8080/images/superhero.png",
      scaledSize: new google.maps.Size(50, 50) // scaled size
      // origin: new google.maps.Point(0,0), // origin
      //  anchor: new google.maps.Point(0, 0) // anchor
    }
  };
  //addPinToMap(map, 45.5100, -122.700);

  // Get locations from database by doing a GET request to /newItem/list
  // Modified from example in the class slides
  let req = new XMLHttpRequest();
  req.onreadystatechange = function() {
    if (req.readyState == 4) {
      if (req.status == 200) {
        let results = JSON.parse(req.response);
        var ul = document.getElementById("taskList");
        for (i in results) {
          task = results[i];
          addPinToMap(map, task.latitude, task.longitude);
          if (ul != null) {
            var li = htmlToElement(
              '<li class="list-group-item"><button onclick="confirmFunction()" class="btn btn-secondary btn-lg btn-block"><strong>' +
                task.name +
                "</strong><br>Distance:</button></li>"
            );
            ul.appendChild(li);
          }
        }
      }
    }
  };
  req.open("GET", "/newItem/list", true);
  req.send();

  var marker = new google.maps.Marker({
    position: location,
    icon: icons.start,
    map: map
  });
  // getting current location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var startLocal = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      // I utilized this to set starting location:  https://developers.google.com/maps/documentation/javascript/geolocation
      map.setCenter(startLocal);
      marker.setPosition(startLocal);
      //infoWindow.setPosition(pos);
      //  infoWindow.setContent('Location found.');
      //  infoWindow.open(map);
      //  map.setCenter(pos);
    });
  }

  /*
  test_data.forEach(function(element) {
    console.log(element);
    addPinToMap(map, element.location.longitude, element.location.latitude);
    var name = element.text;
    var ul = document.getElementById("taskList");
    var li = htmlToElement(
      '<li class="list-group-item"><button onclick="confirmFunction()" class="btn btn-secondary btn-lg btn-block"><strong>' +
        element.text +
        "</strong><br>Distance:</button></li>"
    );
    ul.appendChild(li);
  });
  */
}

function addPinToMap(map, latitude, longitude) {
  var pinLocation = {
    lat: latitude,
    lng: longitude
  };
  var marker = new google.maps.Marker({
    position: pinLocation,
    map: map
  });
}
