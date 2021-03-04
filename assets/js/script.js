// HTML Element Handlers
var currTempFieldEl = $('.temperature');
var currCityDateFieldEl = $('.cityDate');
var currHumidFieldEl = $('.humidity');
var currWindFieldEl = $('.wind');
var currUvIndFieldEl = $('.uv');


var key = config.OWM_API_KEY;
var cityName = "";
var cityNameUri = "";
var coord = {
    lon: 0,
    lat: 0,
};
var weather = {
    icon: "",   // Doesn't work atm
};
var main = {
    temp: 0, // fahrenheit
    humidity: 0,    //  Doesn't work atm
};
var wind = {
    speed: 0,
};
var uvIndex = {
    uvi: 0, //  Doesn't work atm
};

var fiveDayStats = [
    {
        date: "",
        icon: "",
        temp: 0,
        humidity: 0,
    },
    {
        date: "",
        icon: "",
        temp: 0,
        humidity: 0,
    },
    {
        date: "",
        icon: "",
        temp: 0,
        humidity: 0,
    },
    {
        date: "",
        icon: "",
        temp: 0,
        humidity: 0,
    },
    {
        date: "",
        icon: "",
        temp: 0,
        humidity: 0,
    },
]

//////////////////////////
// Open Weather Map API //
//////////////////////////

// owm - current weather api
var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityNameUri}&units=imperial&appid=${key}`;
// owm - one call api (to get UV Index)
var apiUvUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude={minutely,hourly,daily,alerts}&units=imperial&appid=${key}`;
// owm - five day api
var apiFiveDayUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityNameUri}&units=imperial&appid=${key}`;
// list[i].dt
// list[i].main.temp
// list[i].main.humidity
// list[i].weather.icon
var apiIconUrl = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;

var formSearchEl = $('.searchForm');


var formSubmitHandler = function (event) {
    event.preventDefault();

    cityName = $('input[name="search"').val().trim();
    cityNameUri = cityName.replace(" ", "%20");
    getCurrentWeather();
};

function getCurrentWeather() {
    apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityNameUri}&units=imperial&appid=${key}`;

    fetch(apiUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    coord.lat = data.coord.lat;
                    coord.lon = data.coord.lon;
                    weather.icon = data.weather[0].icon;
                    main.temp = data.main.temp;
                    main.humidity = data.main.humidity;
                    wind.speed = data.wind.speed;
                    apiUvUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude={minutely,hourly,daily,alerts}&units=imperial&appid=${key}`;
                    apiIconUrl = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;
                    getUvIndex(coord.lat, coord.lon);
                    displayCurrWeather();   // simply logs to console atm
                });
            } else {
                alert('Error: ' + response.statusText);
            }
        })
        .catch(function (error) {
            alert('Unable to connect to Open Weather Map');
        });
};

function getUvIndex(latitude, longitude) {
    fetch(apiUvUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    // locally sets current uv index
                    uvIndex.uvi = data.current.uvi;
                });
            } else {
                alert('Error: ' + response.statusText);
            }
        })
        .catch(function (error) {
            alert('Unable to connect to Open Weather Map');
        });
}

function displayCurrWeather() {
    // console.log("coords: lon: " + coord.lon + ", lat: " + coord.lat);
    // console.log("current iconId: " + weather.icon);
    // console.log("current temp: " + main.temp);
    // console.log("current humidity: " + main.humidity);
    // console.log("current wind: " + wind.speed);
    // console.log("current uvIndex: " + uvIndex.uvi);
    currCityDateFieldEl.val(`${cityName} (${Date.now()})`);
    currUvIndFieldEl.removeClass('d-none');
}



// form submit handler
formSearchEl.on('submit', formSubmitHandler);