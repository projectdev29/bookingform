var countryCodes = require("./countrycodes.json"),
  Map = require("collections/map");
var countryCodesMap = new Map();
var countries = [];

for (var i = 0, len = countryCodes.length; i < len; i++) {
  var country = countryCodes[i];
  countryCodesMap.set(country.countryName, country.iso2);
  countries.push(country.countryName);
}

var CountryCodes = function () {};

CountryCodes.getCountries = function () {
  return countries;
};

CountryCodes.getISO2 = function (countryName) {
  var countryIso2 = countryCodesMap.get(countryName);
  return countryIso2;
};

module.exports = CountryCodes;
