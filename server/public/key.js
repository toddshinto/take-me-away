/* eslint-disable no-undef */
const inputSrc = document.createElement('script');
const mainJs = document.createElement('script');

inputSrc.src = "https://maps.googleapis.com/maps/api/js?key=" + browserKey + "&libraries=places";
mainJs.src = "main.js"
document.querySelector('body').appendChild(inputSrc, mainJs)
