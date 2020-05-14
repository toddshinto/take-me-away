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
var flightQuery;
var carrierArray;
var destination;
var destinationCity;
var minQuote;
var city;
var date;
var today = new Date().toISOString().substr(0, 10);
var tbody = document.querySelector('tbody');
var tableContainer = document.getElementById('table-container');
var formContainer = document.getElementById('form-container');
var input = document.getElementById('city-input');
var loadingScreen = document.getElementById('loading-screen');
var titleContainer = document.getElementById('title-container');
var autocomplete = new google.maps.places.Autocomplete(input, options);
//auto complete cities only
var options = {
  types: ['(cities)']
}
//submit event listener=>urlify=>get geo code
var citySubmit = document.querySelector('form');

citySubmit.addEventListener('submit', handleSubmit);
document.getElementById('date').value = today;

function handleSubmit(event) {
  event.preventDefault();
  console.log(event);
  var formData = new FormData(event.target);
  city = formData.get('city-input');
  date = formData.get('date');
  console.log(city);
  urlify(city);
  loadingScreen.classList.remove('hidden');
  titleContainer.classList.add('hidden');
  formContainer.classList.add('hidden');
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
    destinationCity = data.Places[0].PlaceName;
    console.log(destinationCity);
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

function findFlights(airportName) {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/LAX-sky/"+airportName+"/"+date,
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
  if (flightQuery.Carriers.length != 0){
    carrierArray = flightQuery.Carriers;
    destination = flightQuery.Places[1].Name;
    destinationCity = flightQuery.Places[1].CityName;
    if (flightQuery.Quotes.length > 0) {
      minQuote = "$"+flightQuery.Quotes[0].MinPrice;
    } else {
      minQuote = "N/A";
    }
    renderFlightRow(carrierArray, destination, destinationCity, minQuote);
  } else {
    console.log(flightQuery);
    renderNoFlights(city, destinationCity);
  }
  loadingScreen.classList.add('hidden');
  tableContainer.classList.remove('hidden');
  titleContainer.classList.remove('hidden');
}

function renderNoFlights(city, destinationCity) {
  var row = document.createElement('tr');
  var tdTryGoogle = document.createElement('td');
  var tdTryGoogleLink = document.createElement('a');
  var tdTryGoogleTextNode = document.createTextNode('Skyscanner returned 0 results. Try Google?');
  airportName = airportName.replace('-sky','');
  tdTryGoogleLink.appendChild(tdTryGoogleTextNode);
  date = date.replace(/-/g, ' ')
  tdTryGoogleLink.href = "https://www.google.com/search?q="+city+"+to+"+destinationCity+" " + date;
  tdTryGoogleLink.target = "_blank";
  tdTryGoogle.append(tdTryGoogleLink);
  tdTryGoogle.colSpan = 5;
  row.append(tdTryGoogle);
  tbody.append(row);
}

function renderFlightRow(carrierArray, destination, destinationCity, minQuote) {
  while (tbody.firstChild) {
    tbody.removeChild(tbody.lastChild);
  }
  var row = document.createElement('tr');
  var tdCarrier = document.createElement('td');
  var tdDestination = document.createElement('td');
  var tdDestinationCity = document.createElement('td');
  var tdMinQuote = document.createElement('td');
  var tdGoogle = document.createElement('td');
  var tdGoogleLink = document.createElement('a');
  var tdGoogleLinkTextNode = document.createTextNode('Google Flights');
  tdGoogleLink.appendChild(tdGoogleLinkTextNode);
  date = date.replace(/-/g, ' ')
  tdGoogleLink.href = "https://www.google.com/search?q="+city+"+to+"+destinationCity+" "+date + " one way";
  tdGoogleLink.target = "_blank";
  tdGoogle.append(tdGoogleLink);
  tdCarrier.textContent = carrierArray[0].Name;
  tdDestination.textContent = destination;
  tdDestinationCity.textContent = destinationCity;
  tdMinQuote.textContent = minQuote;
  row.append(tdCarrier, tdDestination, tdDestinationCity, tdMinQuote, tdGoogle);
  tbody.append(row);
}
