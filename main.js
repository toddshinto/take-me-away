//AIzaSyANoXq3hQzS5iIGDFtR8NkFD2dn1hSB9H4

var city1;
var geocode;
var latitude;
var longitude;
var antiLat;
var antiLong;
var boundLat;
var boundLong;
var boundLat2;
var boundLong2;
var airportName;
var airportList = [];
var searchRequest;

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
  var date = formData.get('date');
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

function antipode(latitude, longitude) {
  antiLat = latitude*(-1);
  if (longitude < 0) {
    antiLong = longitude+180;
  } else {
    antiLong = longitude - 180;
  }
  console.log('antipode', antiLat, antiLong);
  reverseGeocode(antiLat, antiLong);
  boundLat = (antiLat-30);
  boundLong = (antiLong-30);
  boundLat2 = (antiLat+30);
  boundLong2 = (antiLong+30);
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
  airportInfo(data);
}
function airportInfo(airportList) {
  searchRequest = airportList.geonames[0].adminName1 + " " + airportList.geonames[0].countryName;
  searchRequest = searchRequest.trim().replace(/\s/g, '%20');
  searchRequest = searchRequest.replace(/,/g, '');
  findAirport(searchRequest)
}

function nearestAirportSuccess (data) {
  console.log('airport', data);
}

//finds airport from list using adminname and countryname, if no result tries again using only countryname
function findAirport(searchRequest) {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/US/USD/en-US/?query="+searchRequest,
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
      "x-rapidapi-key": "13da362209msh7f0d9d06f77d4fep13c9d0jsnf99958022cd8"
    }
  }
  $.ajax(settings).done(function (data) {
    console.log('data', data, 'data.length', data.Places.length);
    if (data.Places.length != 0) {
      airportName = data.Places[0].PlaceId;
    }
    checkEmpty(airportName);
  });
}

function checkEmpty(airportName) {
  if (airportName != undefined) {
    console.log('airport name', airportName);
    findFlights(airportName);
  } else {
    searchRequest = airportList.geonames[0].countryName;
    findAirport(searchRequest);
  }
}
var flightQuery;
var carrierArray;
var destination;
var destinationCity;
var minQuote;

function findFlights(airportName) {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/LAX-sky/"+airportName+"/2020-12-17",
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
      "x-rapidapi-key": "13da362209msh7f0d9d06f77d4fep13c9d0jsnf99958022cd8"
    }
  }

  $.ajax(settings).done(function (response) {
    console.log('yes', response);
    flightQuery = response;
    flightInformation(flightQuery);
  });
}

function flightInformation(flightQuery) {
  carrierArray = flightQuery.Carriers;
  destination = flightQuery.Places[1].Name;
  destinationCity = flightQuery.Places[1].CityName;
  minQuote = flightQuery.Quotes[0].MinPrice;
}

function testFlights() {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/LAX-sky/SFO-sky/2020-12-17",
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
      "x-rapidapi-key": "13da362209msh7f0d9d06f77d4fep13c9d0jsnf99958022cd8"
    }
  }

  $.ajax(settings).done(function (response) {
    console.log('yes', response);
    flightQuery = response;
  });
}
