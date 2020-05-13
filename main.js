//AIzaSyANoXq3hQzS5iIGDFtR8NkFD2dn1hSB9H4

function barf() {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/US/USD/en-US/?query=perth%20australia",
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
      "x-rapidapi-key": "13da362209msh7f0d9d06f77d4fep13c9d0jsnf99958022cd8"
    }
  }

  $.ajax(settings).done(function (response) {
    console.log(response);
  });
}

function yap() {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsedates/v1.0/US/USD/en-US/ADD-sky/LAX-sky/2020-05-14",
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
      "x-rapidapi-key": "13da362209msh7f0d9d06f77d4fep13c9d0jsnf99958022cd8"
    }
  }

  $.ajax(settings).done(function (response) {
    console.log(response);
  });

}

//auto complete cities only
var options = {
  types: ['(cities)']
}
var input = document.getElementById('city-input');
var autocomplete = new google.maps.places.Autocomplete(input, options);

//submit event listener=>urlify=>get geo code
var citySubmit = document.querySelector('form');
citySubmit.addEventListener('submit', handleSubmit);
function handleSubmit(event) {
  event.preventDefault();
  console.log(event);
  var formData = new FormData(event.target);
  var city = formData.get('city-input');
  console.log(city);
  urlify(city);
  event.target.reset();
}

function urlify(city) {
  city = city.trim().replace(/\s/g, '%20');
  city = city.replace(/,/g,'');
  console.log(city);
  cityGeocode(city);
}
//returns geocode information
function cityGeocode(city) {
  $.ajax({
    url: 'https://maps.googleapis.com/maps/api/geocode/json?address=' + city + '&key=AIzaSyANoXq3hQzS5iIGDFtR8NkFD2dn1hSB9H4',
    method: "GET",
    success: logSuccess,
    fail: logError
  })
}
var city1;
var geocode;
var latitude;
var longitude;
//retrieves lat/long from returned geocode data
function logSuccess(data) {
  city1 = data;
  geocode = city1.results[0].geometry.location;
  latitude = geocode.lat;
  longitude = geocode.lng;
  console.log('success', data)
  console.log('logsucces', latitude, longitude);
  antipode(latitude, longitude);
}
function logError(error) {
  console.log('error')
}
var antiLat;
var antiLong;
var boundLat;
var boundLong;
var boundLat2;
var boundLong2;
function antipode(latitude, longitude) {
  antiLat = latitude*(-1);
  if (longitude < 0) {
    antiLong = longitude+180;
  } else {
    antiLong = longitude - 180;
  }
  console.log('antipode', antiLat, antiLong);
  reverseGeocode(antiLat, antiLong);
  boundLat = (antiLat-20);
  boundLong = (antiLong-20);
  boundLat2 = (antiLat+20);
  boundLong2 = (antiLong+20);
  geoNames(boundLat, boundLong, boundLat2, boundLong2)
}

function reverseGeocode(antiLat, antiLong) {
  $.ajax({
    method: "GET",
    url: "https://maps.googleapis.com/maps/api/geocode/json?latlng="+antiLat+","+antiLong+"&"+googleAPIKey,
    success: nearestAirportSuccess,
    fail: logError
  })
}
var airportList = [];
var airportLat;
var airportLong;
function geoNames(boundLat, boundLong, boundLat2, boundLong2) {
  $.ajax({
    method: "GET",
    url: "http://api.geonames.org/search?type=json&q=airport&featureCode=AIRP&west="+boundLong+"&north="+boundLat2+"&east="+boundLong2+"&south="+boundLat+"&username=toddshinto",
    success: geoNamesSuccess,
    fail: logError
  })
}

function geoNamesSuccess(data) {
  console.log(data);
  airportList = data;
  airportLat = airportList.geonames[0].lat;
  airportLong = airportList.geonames[0].lng;
  nearestAirport(airportLat, airportLong);
}
function nearestAirport(airportLat, airportLong) {
  $.ajax({
    method: "GET",
    url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=airport&inputtype=textquery&fields=photos,formatted_address,name,place_id,plus_code&locationbias=point:" + airportLat + ',' + airportLong + '&' + googleAPIKey,
    success: nearestAirportSuccess,
    fail: logError
  })
}
function nearestAirportSuccess (data) {
  console.log('airport', data);
}
