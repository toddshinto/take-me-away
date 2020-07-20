/* eslint-disable no-undef */
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
let lat1;
let lat2;
let lon1;
let lon2;
let homeAirportName;
let homeAirportCode;
const farthestDistance = 12450;
let today = new Date();
today.setDate(today.getDate() + 1);
today = today.toISOString().substr(0, 10);
const tbody = document.querySelector('tbody');
const tableContainer = document.getElementById('table-container');
const formContainer = document.getElementById('form-container');
let input = document.getElementById('city-input');
const loadingScreen = document.getElementById('loading-screen');
const titleContainer = document.getElementById('title-container');
const resetButton = document.getElementById('reset-button');
const mainContainer = document.getElementById('main-container');
const searchFailed = document.getElementById('search-failed-container');
let distanceRatio;
const distanceWidth = document.getElementById('distance');
const distanceMiles = document.getElementById('distance-miles');
const searchFailedButton = document.getElementById('search-failed-btn');
const toStart = document.getElementById('to-start');
const instPage = document.getElementById('instructions-page');
const skyMsg = document.querySelector('.sky-notification');

//auto complete cities only
let options = {
  types: ['(cities)']
}

// eslint-disable-next-line no-undef, no-unused-vars
let inputSrc = document.createElement('script');

inputSrc.setAttribute('src', `https://maps.googleapis.com/maps/api/js?key=${browserKey}&libraries=places`)
document.body.appendChild(inputSrc);
inputSrc.addEventListener('load', scriptLoaded, false)

function scriptLoaded() {
  // eslint-disable-next-line no-unused-vars
  var autocomplete = new google.maps.places.Autocomplete(input, options);
}
//submit event listener=>urlify=>get geo code
const citySubmit = document.querySelector('form');

toStart.addEventListener('click', toStartPage)
citySubmit.addEventListener('submit', handleSubmit);
document.getElementById('date').value = today;
resetButton.addEventListener('click', resetPage);
searchFailedButton.addEventListener('click', tryAgainPage);
loadingScreen.addEventListener('click', flyPlane);
document.getElementById('dismiss-button').addEventListener('click', dismiss);

function toStartPage() {
  instPage.classList.add('hidden');
  mainContainer.classList.remove('hidden');
}

function dismiss() {
  skyMsg.classList.add('hidden');
}

function tryAgainPage() {
  searchFailed.classList.add('hidden');
  mainContainer.classList.remove('hidden');
  skyMsg.classList.remove('hidden');
  resetPage();
}

function resetPage() {
  while (tbody.firstChild) {
    tbody.removeChild(tbody.lastChild);
  }
  formContainer.classList.remove('hidden');
  tableContainer.classList.add('hidden');
  titleContainer.classList.remove('hidden');
  skyMsg.classList.remove('hidden');
  document.getElementById('date').value = today;
}

function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  city = formData.get('city-input');
  urlify(city);
  loadingScreen.classList.remove('hidden');
  titleContainer.classList.add('hidden');
  formContainer.classList.add('hidden');
  event.target.reset();
}

function urlify(city) {
  homeCityUnformatted = city;
  city = city.replace(/,/g, '');
  // city = city.trim().replace(/\s/g, '%20');
  cityGeocode(city);
}

function flyPlane() {
  if (loadingScreen.classList.contains('loading-screen-flying')) {
    loadingScreen.classList.remove('loading-screen-flying')
  } else {
    loadingScreen.classList.add('loading-screen-flying')
  }
}

//returns geocode information
function cityGeocode(city) {
  $.ajax({
    url: `/api/geocode/${city}`,
    method: "GET",
    success: logSuccess,
    error: logError
  })
}

//retrieves lat/long from returned geocode data
function logSuccess(data) {
  city1 = data;
  geocode = city1.results[0].geometry.location;
  lat1=geocode.lat;
  lon1=geocode.lng;
  latitude = geocode.lat;
  longitude = geocode.lng;
  antipode(latitude, longitude);
  findHomeAirport(latitude, longitude);
}

function findHomeAirport(lat, lng) {
  let closest = airports[0];
  let airportDistance = Infinity;
  for (let i = 0; i < airports.length; i++) {
    const radLat = Math.PI * lat / 180;
    const radAirLat = Math.PI * airports[i].latitude_deg / 180;
    const theta = lng - airports[i].longitude_deg;
    const radTheta = Math.PI * theta / 180;
    let distance = Math.sin(radLat) * Math.sin(radAirLat) + Math.cos(radLat) * Math.cos(radAirLat) * Math.cos(radTheta);
    distance = Math.acos(distance);
    distance = distance * 180 / Math.PI;
    distance = distance * 60 * 11515;
    if (distance < airportDistance) {
      closest = airports[i];
      airportDistance = distance;
    }
  }
  homeAirportCode = closest.iata_code;
  homeAirportName = closest.name;
}

function logError() {
  displaySearchFailed('Invalid city.')
}

function geoNamesFailure() {
  displaySearchFailed('Search timed out.')
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
    error: geoNamesFailure
  })
}

function geoNamesSuccess(data) {
  airportList = data;
  lat2 = parseFloat(airportList.geonames[0].lat);
  lon2 = parseFloat(airportList.geonames[0].lng);
  airportInfo(data);
}

function airportInfo(airportList) {
  if (!airportList.geonames[0].adminName1.includes('.')) {
    searchRequest = airportList.geonames[0].adminName1 + " " + airportList.geonames[0].countryName;
  } else {
    searchRequest = airportList.geonames[0].countryName
  }
  searchRequest = searchRequest.trim().replace(/\s/g, '%20');
  searchRequest = searchRequest.replace(/,/g, '');
  findAirport(searchRequest)
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
      "x-rapidapi-key": rapidAPIKey
    }
  }
  $.ajax(settings).done(function (data) {
    if (data.Places.length < 1 && typeof searchRequest === 'string' ) {
      const searchRequestArr = searchRequest.split('%20')
      findAirport(searchRequestArr[searchRequestArr.length-1])
    } else if (data.Places.length < 1 && typeof searchRequest !== 'string' ) {
      displaySearchFailed('Sorry')
    }
    destinationCity = `${data.Places[data.Places.length-1].PlaceName}, ${data.Places[data.Places.length-1].CountryName}`;
    if (data.Places.length !== 0) {
      airportName = data.Places[data.Places.length - 1].PlaceId;
    }
    checkEmpty(airportName);
  });
}

function displaySearchFailed(message) {
  const msgContainer = document.createElement('div');
  const msg = document.createTextNode(message);
  const searchBox = document.getElementById('search-failed');
  if (searchBox.childElementCount > 2) {searchBox.removeChild(searchBox.children[1])}
  msgContainer.className='failed-msg';
  msgContainer.append(msg);
  searchBox.insertBefore(msgContainer, searchBox.childNodes[2]);
  loadingScreen.classList.add('hidden');
  searchFailed.classList.remove('hidden');
}

function checkEmpty(airportName) {
  if (airportName !== undefined) {
    findFlights(airportName);
  } else {
    searchRequest = airportList.geonames[0].CountryName;
    findAirport(searchRequest);
  }
}

function findFlights(airportName) {
  const settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/"+homeAirportCode+"-sky/"+airportName+"/anytime",
    "method": "GET",
    "headers": {
      "x-rapidapi-host": "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com",
      "x-rapidapi-key": rapidAPIKey
    }
  }
  $.ajax(settings).done(function (response) {
    flightQuery = response;
    flightInformation(flightQuery);
  })
    .fail(() => {
      displaySearchFailed('Invalid route');
    });
}

function flightInformation(flightQuery) {
  if (flightQuery.Carriers.length !== 0){
    carrierArray = flightQuery.Carriers;
    destination = `${flightQuery.Places[1].Name}, ${flightQuery.Places[1].CountryName}`;
    destinationCity = flightQuery.Places[1].CityName;
    if (flightQuery.Quotes.length > 0) {
      minQuote = "$"+flightQuery.Quotes[0].MinPrice;
    } else {
      minQuote = "N/A";
    }
    departureDate = new Date(`${flightQuery.Quotes[0].OutboundLeg.DepartureDate}`);
    const dateFormatted = `${departureDate.getMonth()+1}-${departureDate.getDate()}-${departureDate.getFullYear()}`;
    renderFlightRow(carrierArray, destination, destinationCity, minQuote, dateFormatted);
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
  const tdTryGoogleTextNode = document.createTextNode('Skyscanner returned 0 results for flights from '+homeAirportName+ ' to '+destinationCity+'.');
  const tdTryGoogleBtn = document.createElement('span');
  const tdTryGoogleBtnText = document.createTextNode('Google?');
  tdTryGoogle.className = 'no-results';
  tdTryGoogleBtn.append(tdTryGoogleBtnText);
  tdTryGoogleBtn.className = 'try-google';
  airportName = airportName.replace('-sky','');
  tdTryGoogleLink.appendChild(tdTryGoogleBtn);
  tdTryGoogleLink.href = "https://www.google.com/search?q="+city+"+to+"+destinationCity;
  tdTryGoogleLink.target = "_blank";
  tdTryGoogle.append(tdTryGoogleTextNode);
  tdTryGoogle.append(tdTryGoogleLink);
  tdTryGoogle.colSpan = 5;
  distance = calculateDistance();
  distanceRatio = (distance/farthestDistance)*100;
  distance = Math.round(distance);
  distance = numberWithCommas(distance);
  distanceMiles.textContent = distance+" mi";
  distanceWidth.setAttribute('style', "width: " + distanceRatio + "%");
  row.append(tdTryGoogle);
  tbody.append(row);
  skyMsg.classList.add('hidden');
}
function numberWithCommas(num) {
  const numParts = num.toString().split('.');
  numParts[0] = numParts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return numParts.join('.');
}

function renderFlightRow(carrierArray, destination, destinationCity, minQuote, dateFormatted) {
  while (tbody.firstChild) {
    tbody.removeChild(tbody.lastChild);
  }
  const dataCells = [carrierArray, destination, destinationCity, minQuote, dateFormatted]
  const buttonRow = document.createElement('tr');
  const fromRow = document.createElement('tr');
  const fromCell = document.createElement('td');
  const dateSplit = dateFormatted.split('-');
  dateSplit[2] = dateSplit[2].replace('20','');
  if (dateSplit[0] < 10) {dateSplit[0]=`0${dateSplit[0]}`}
  const searchDate = dateSplit[2]+dateSplit[0]+dateSplit[1];
  fromCell.setAttribute('colspan', 2);
  fromCell.textContent = `From ${homeAirportName}`
  fromRow.append(fromCell)
  tbody.append(fromRow)
  const tdGoogle = document.createElement('td');
  tdGoogle.className = 'clickable-cell';
  const bookNowCell = document.createElement('td');
  bookNowCell.textContent = 'book now';
  const tdGoogleLink = document.createElement('a');
  const tdGoogleLinkTextNode = document.createTextNode('Skyscanner');
  tdGoogleLink.appendChild(tdGoogleLinkTextNode);
  airportName = airportName.replace('-sky', '');
  tdGoogleLink.href = `https://www.skyscanner.com/transport/flights/${homeAirportCode}/${airportName}/${searchDate}/?adults=1&children=0&adultsv2=1&childrenv2=&infants=0&cabinclass=economy&rtn=0&preferdirects=false&outboundaltsenabled=false&inboundaltsenabled=false&ref=home`;
  tdGoogleLink.target = "_blank";
  tdGoogle.append(tdGoogleLink);
  for (let i = 0; i < 5; i++) {
    const row = document.createElement('tr');
    const title = document.createElement('td');
    const dataEntry = document.createElement('td');
    switch (i) {
      case 0:
        title.textContent = 'Carrier:'
        break;
      case 1:
        title.textContent = 'Destination:'
        break;
      case 2:
        title.textContent = 'City:'
        break;
      case 3:
        title.textContent = 'Min Quote:'
        break;
      case 4:
        title.textContent = 'Departure Date:'
        break;
    }
    if (i === 0) {
      dataEntry.textContent = dataCells[0][0].Name;
    } else if (i === 3) {
      dataEntry.textContent = dataCells[i]+'*';
    } else {
      dataEntry.textContent = dataCells[i];
    }
    row.append(title, dataEntry);
    tbody.append(row);
  }
  buttonRow.append(bookNowCell, tdGoogle)
  distance = calculateDistance();
  distanceRatio = (distance / farthestDistance) * 100;
  distance = Math.round(distance);
  distance = numberWithCommas(distance);
  distanceMiles.textContent = distance + " miles";
  distanceWidth.setAttribute('style', "width: " + distanceRatio + "%");
  tbody.append(buttonRow);
}

function calculateDistance() {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = (R * c)/1609;
  return d;
}
