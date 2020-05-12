function nearestAirport() {
  $.ajax ({
    method: "GET",
    url: "https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=airport&inputtype=textquery&fields=photos,formatted_address,name,place_id,plus_code&locationbias=circle:2000@33.9416,-118.4085&"+googleAPIKey,
    success: logSuccess,
    error: logError
  })
}

function logSuccess(data) {
  console.log('success', data)
}
function logError(error) {
  console.log('error')
}

//AIzaSyANoXq3hQzS5iIGDFtR8NkFD2dn1hSB9H4

var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://iatacodes-iatacodes-v1.p.rapidapi.com/api/v5/airports?code=CDG&lang=en&api_key=13da362209msh7f0d9d06f77d4fep13c9d0jsnf99958022cd8",
  "method": "GET",
  "headers": {
    "x-rapidapi-host": "iatacodes-iatacodes-v1.p.rapidapi.com",
    "x-rapidapi-key": "13da362209msh7f0d9d06f77d4fep13c9d0jsnf99958022cd8"
  }
}
function code() {
  $.ajax(settings).done(function (response) {
    console.log(response);
  });
}

function barf() {
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/US/USD/en-US/?query=Addis%20Ababa",
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
