let city1;
let geocode;
let latitude;
let longitude;
let antiLat;
let antiLong;
let boundLat;
let boundLong;
let boundLat2;
let boundLong2;
let airportName;
let airportList = [];
let searchRequest;
let flightQuery;
let carrierArray;
let destination;
let destinationCity;
let minQuote;
let distance;
let city;
let date;
let lat1;
let lat2;
let lon1;
let lon2;
let homeCity;
let homeAirportName;
let homeCityUnformatted;
const farthestDistance = 12450;
let today = new Date().toISOString().substr(0, 10);
const tbody = document.querySelector('tbody');
const tableContainer = document.getElementById('table-container');
const formContainer = document.getElementById('form-container');
let input = document.getElementById('city-input');
const loadingScreen = document.getElementById('loading-screen');
const titleContainer = document.getElementById('title-container');
const resetButton = document.getElementById('reset-button');
const landingPage = document.getElementById('landing-page');
const getStarted = document.getElementById('get-started');
const mainContainer = document.getElementById('main-container');
const searchFailed = document.getElementById('search-failed-container');
let distanceRatio;
const distanceWidth = document.getElementById('distance');
const distanceMiles = document.getElementById('distance-miles');
const searchFailedButton = document.getElementById('search-failed-btn');

//auto complete cities only
let options = {
  types: ['(cities)']
}

// eslint-disable-next-line no-undef, no-unused-vars
let autocomplete = new google.maps.places.Autocomplete(input, options);
//submit event listener=>urlify=>get geo code
const citySubmit = document.querySelector('form');

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
  const formData = new FormData(event.target);
  city = formData.get('city-input');
  date = formData.get('date');
  urlify(city);
  loadingScreen.classList.remove('hidden');
  titleContainer.classList.add('hidden');
  formContainer.classList.add('hidden');
  event.target.reset();
}

function urlify(city) {
  city = city.replace(/,/g, '');
  // city = city.trim().replace(/\s/g, '%20');
  cityGeocode(city);
}

//returns geocode information
function cityGeocode(city) {
  $.ajax({
    url: `/api/geocode/${city}`,
    method: "GET",
    success: logSuccess,
    fail: logError
  })
}

//retrieves lat/long from returned geocode data
function logSuccess(data) {
  city1 = data;
  console.log(data);
  console.log(city1);
  geocode = city1.results[0].geometry.location;
  lat1=geocode.lat;
  lon1=geocode.lng;
  latitude = geocode.lat;
  longitude = geocode.lng;
  antipode(latitude, longitude);
  homeAirport(city1);
}

function logError(error) {
  console.error(error)
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

function homeAirport() {
  homeCity = city1.results[0].formatted_address.split(',');
  homeCityUnformatted = homeCity[0];
  homeCity = homeCity[0];
  homeCity = homeCity.trim().replace(/\s/g, '%20');
  findHomeAirport(homeCity);
}

function findHomeAirport(homeCity) {
  const settings = {
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
  const settings = {
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
  const settings = {
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
    .fail(() => {
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

function renderNoFlights(city, destinationCity) {
  const row = document.createElement('tr');
  const tdTryGoogle = document.createElement('td');
  const tdTryGoogleLink = document.createElement('a');
  const tdTryGoogleTextNode = document.createTextNode('Skyscanner returned 0 results for flights from '+homeCityUnformatted+ ' to '+destinationCity+'. Try Google?');
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
function numberWithCommas(num) {
  const numParts = num.toString().split('.');
  numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return numParts.join('.');
}

function renderFlightRow(carrierArray, destination, destinationCity, minQuote) {
  while (tbody.firstChild) {
    tbody.removeChild(tbody.lastChild);
  }
  const row = document.createElement('tr');
  const row2 = document.createElement('tr');
  const row3 = document.createElement('tr');
  const row4 = document.createElement('tr');
  const row5 = document.createElement('tr');
  const tdCarrier = document.createElement('td');
  const carrierCell = document.createElement('td');
  carrierCell.textContent = 'carrier:';
  const tdDestination = document.createElement('td');
  const destinationCell = document.createElement('td');
  destinationCell.textContent = 'destination:';
  const tdDestinationCity = document.createElement('td');
  const cityCell = document.createElement('td');
  cityCell.textContent = 'city:';
  const tdMinQuote = document.createElement('td');
  const minQuoteCell = document.createElement('td');
  minQuoteCell.textContent = 'min quote:'
  const tdGoogle = document.createElement('td');
  const bookNowCell = document.createElement('td');
  bookNowCell.textContent = 'book now: '
  const tdGoogleLink = document.createElement('a');
  const tdGoogleLinkTextNode = document.createTextNode('Skyscanner');
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
