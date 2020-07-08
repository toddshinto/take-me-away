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
var lat1;
var lat2;
var lon1;
var lon2;
var farthestDistance = 12450;
var today = new Date().toISOString().substr(0, 10);
var tbody = document.querySelector('tbody');
var tableContainer = document.getElementById('table-container');
var formContainer = document.getElementById('form-container');
var input = document.getElementById('city-input');
var loadingScreen = document.getElementById('loading-screen');
var titleContainer = document.getElementById('title-container');
var resetButton = document.getElementById('reset-button');
var landingPage = document.getElementById('landing-page');
var getStarted = document.getElementById('get-started');
var mainContainer = document.getElementById('main-container');
var searchFailed = document.getElementById('search-failed-container');
var distanceRatio;
var distanceWidth = document.getElementById('distance');
var distanceMiles = document.getElementById('distance-miles');
var searchFailedButton = document.getElementById('search-failed-btn');
//auto complete cities only
var options = {
  types: ['(cities)']
}
var autocomplete = new google.maps.places.Autocomplete(input, options);
//submit event listener=>urlify=>get geo code
var citySubmit = document.querySelector('form');

citySubmit.addEventListener('submit', handleSubmit);
document.getElementById('date').value = today;
resetButton.addEventListener('click', resetPage);
getStarted.addEventListener('click', startPage);
searchFailedButton.addEventListener('click', tryAgainPage);

function tryAgainPage() {
  searchFailed.classList.add('hidden');
  mainContainer.classList.remove('hidden');
  resetPage();
}

function startPage() {
  landingPage.classList.add('hidden');
  mainContainer.classList.remove('hidden');
}

function resetPage() {
  while (tbody.firstChild) {
    tbody.removeChild(tbody.lastChild);
  }
  formContainer.classList.remove('hidden');
  tableContainer.classList.add('hidden');
  titleContainer.classList.remove('hidden');
  document.getElementById('date').value = today;
}

function handleSubmit(event) {
  event.preventDefault();
  var formData = new FormData(event.target);
  city = formData.get('city-input');
  date = formData.get('date');
  urlify(city);
  loadingScreen.classList.remove('hidden');
  titleContainer.classList.add('hidden');
  formContainer.classList.add('hidden');
  event.target.reset();
}

function urlify(city) {
  // city = city.trim().replace(/\s/g, '%20');
  // city = city.replace(/,/g,'');
  cityGeocode(city);
}
//returns geocode information
function cityGeocode(city) {
  $.ajax({
    url: `/api/geocode`,
    method: "GET",
    data: {
      city: city
    },
    success: logSuccess,
    fail: logError
  })
}

//retrieves lat/long from returned geocode data
function logSuccess(data) {
  city1 = JSON.parse(data);
  geocode = city1.results[0].geometry.location;
  lat1=geocode.lat;
  lon1=geocode.lng;
  latitude = geocode.lat;
  longitude = geocode.lng;
  antipode(latitude, longitude);
  homeAirport(city1);
}
function logError(error) {
  console.error('error')
}

function antipode(latitude, longitude) {
  antiLat = latitude*(-1);
  if (longitude < 0) {
    antiLong = longitude+180;
  } else {
    antiLong = longitude - 180;
  }
  boundLat = (antiLat-30);
  boundLong = (antiLong-30);
  boundLat2 = (antiLat+30);
  boundLong2 = (antiLong+30);
  geoNames(boundLat, boundLong, boundLat2, boundLong2)
}

function geoNames(boundLat, boundLong, boundLat2, boundLong2) {
  $.ajax({
    method: "GET",
    url: `/api/geonames/${boundLat}/${boundLong}/${boundLat2}/${boundLong2}`,
    dataType: "json",
    success: geoNamesSuccess,
    fail: logError
  })
}

function geoNamesSuccess(data) {
  airportList = data;
  lat2 = parseFloat(airportList.geonames[0].lat);
  lon2 = parseFloat(airportList.geonames[0].lng);
  airportInfo(data);
}
function airportInfo(airportList) {
  searchRequest = airportList.geonames[0].adminName1 + " " + airportList.geonames[0].countryName;
  searchRequest = searchRequest.trim().replace(/\s/g, '%20');
  searchRequest = searchRequest.replace(/,/g, '');
  findAirport(searchRequest)
}

var homeCity;
var homeAirportName;
var homeCityUnformatted;
function homeAirport() {
  homeCity = city1.results[0].formatted_address.split(',');
  homeCityUnformatted = homeCity[0];
  homeCity = homeCity[0];
  homeCity = homeCity.trim().replace(/\s/g, '%20');
  findHomeAirport(homeCity);
}
function findHomeAirport(homeCity) {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/US/USD/en-US/?query=" + homeCity,
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
      "x-rapidapi-key": "13da362209msh7f0d9d06f77d4fep13c9d0jsnf99958022cd8"
    }
  }
  $.ajax(settings).done(function (data) {
    homeAirportName = data.Places[0].PlaceName;
    if (data.Places.length != 0) {
      homeAirportName = data.Places[0].PlaceId;
    }
  });
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
    destinationCity = data.Places[data.Places.length-1].PlaceName;
    if (data.Places.length != 0) {
      airportName = data.Places[data.Places.length - 1].PlaceId;
    }
    checkEmpty(airportName);
  });
}

function checkEmpty(airportName) {
  if (airportName != undefined) {
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
    "url": "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/"+homeAirportName+"/"+airportName+"/"+date,
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
      "x-rapidapi-key": "13da362209msh7f0d9d06f77d4fep13c9d0jsnf99958022cd8"
    }
  }
  $.ajax(settings).done(function (response) {
    flightQuery = response;
    flightInformation(flightQuery);
  })
    .fail(function (response) {
      loadingScreen.classList.add('hidden');
      searchFailed.classList.remove('hidden');
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
    renderNoFlights(city, destinationCity);
  }
  loadingScreen.classList.add('hidden');
  tableContainer.classList.remove('hidden');
  titleContainer.classList.remove('hidden');
}
var distance;
function renderNoFlights(city, destinationCity) {
  var row = document.createElement('tr');
  var tdTryGoogle = document.createElement('td');
  var tdTryGoogleLink = document.createElement('a');
  var tdTryGoogleTextNode = document.createTextNode('Skyscanner returned 0 results for flights from '+homeCityUnformatted+ ' to '+destinationCity+'. Try Google?');
  airportName = airportName.replace('-sky','');
  tdTryGoogleLink.appendChild(tdTryGoogleTextNode);
  date = date.replace(/-/g, ' ')
  tdTryGoogleLink.href = "https://www.google.com/search?q="+city+"+to+"+destinationCity+" " + date;
  tdTryGoogleLink.target = "_blank";
  tdTryGoogle.append(tdTryGoogleLink);
  tdTryGoogle.colSpan = 5;
  distance = calculateDistance();
  distanceRatio = (distance/farthestDistance)*100;
  distance = Math.round(distance);
  distance = numberWithCommas(distance);
  distanceMiles.textContent = distance+" miles";
  distanceWidth.setAttribute('style', "width: " + distanceRatio + "%");
  row.append(tdTryGoogle);
  tbody.append(row);
}
function numberWithCommas(x) {
  return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
function renderFlightRow(carrierArray, destination, destinationCity, minQuote) {
  while (tbody.firstChild) {
    tbody.removeChild(tbody.lastChild);
  }
  var row = document.createElement('tr');
  let row2 = document.createElement('tr');
  let row3 = document.createElement('tr');
  let row4 = document.createElement('tr');
  let row5 = document.createElement('tr');
  var tdCarrier = document.createElement('td');
  const carrierCell = document.createElement('td');
  carrierCell.textContent = 'carrier:';
  var tdDestination = document.createElement('td');
  const destinationCell = document.createElement('td');
  destinationCell.textContent = 'destination:';
  var tdDestinationCity = document.createElement('td');
  const cityCell = document.createElement('td');
  cityCell.textContent = 'city:';
  var tdMinQuote = document.createElement('td');
  const minQuoteCell = document.createElement('td');
  minQuoteCell.textContent = 'min quote:'
  var tdGoogle = document.createElement('td');
  const bookNowCell = document.createElement('td');
  bookNowCell.textContent = 'book now: '
  var tdGoogleLink = document.createElement('a');
  var tdGoogleLinkTextNode = document.createTextNode('Skyscanner');
  tdGoogleLink.appendChild(tdGoogleLinkTextNode);
  date = date.replace(/-/g, ' ');
  airportName = airportName.replace('-sky', '');
  homeAirportName = homeAirportName.replace('-sky', '');
  date = date.replace(/\s/g, '');
  date = date.substring(2);
  tdGoogleLink.href = "https://www.skyscanner.com/transport/flights/"+homeAirportName+"/"+airportName+"/"+date+"/?adults=1&children=0&adultsv2=1&childrenv2=&infants=0&cabinclass=economy&rtn=0&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false&ref=home";
  tdGoogleLink.target = "_blank";
  tdGoogle.append(tdGoogleLink);
  tdCarrier.textContent = carrierArray[0].Name;
  tdDestination.textContent = destination;
  tdDestinationCity.textContent = destinationCity;
  tdMinQuote.textContent = minQuote;
  row.append(carrierCell, tdCarrier);
  row2.append(destinationCell, tdDestination);
  row3.append(cityCell, tdDestinationCity);
  row4.append(minQuoteCell, tdMinQuote);
  row5.append(bookNowCell, tdGoogle)
  distance = calculateDistance();
  distanceRatio = (distance / farthestDistance) * 100;
  distance = Math.round(distance);
  distance = numberWithCommas(distance);
  distanceMiles.textContent = distance + " miles";
  distanceWidth.setAttribute('style', "width: " + distanceRatio + "%");
  tbody.append(row, row2, row3, row4, row5);
}

function calculateDistance() {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = (R * c)/1609;
  return d; // in metres
}
