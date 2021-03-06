// HTML Element Handlers
var currTempFieldEl = $('.temperature');
var currCityDateFieldEl = $('.cityDate');
var currHumidFieldEl = $('.humidity');
var currWindFieldEl = $('.wind');
var currUvIndFieldEl = $('.uvIndex');
var currWeatherIconEl = $('weatherIcon');


var key = config.OWM_API_KEY;
var cityName = "";
var cityNameUri = "";
var coord = {
    lon: 0,
    lat: 0,
};
var weather = {
    icon: "",
    desc: "",
};
var main = {
    temp: 0,
    humidity: 0,
};
var wind = {
    speed: 0,
};
var uvIndex = {
    uvi: 0,
};

// Time of data calculation, unix, UTC
var dt = 0;

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
var iconUrl = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;

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
                    dt = data.dt;
                    apiUvUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude={minutely,hourly,daily,alerts}&units=imperial&appid=${key}`;
                    iconUrl = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;
                    weather.desc = data.weather[0].description;
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
    var dtInMs = dt * 1000;
    const dateObject = new Date(dtInMs);
    var todaysDate = dateObject.toLocaleDateString({month: "numeric", day: "numeric", year: "numeric"});
    currCityDateFieldEl.text(`${cityName} (${todaysDate})`);
    currCityDateFieldEl.append($('<img>').attr({'src':`${iconUrl}`,'alt':`${weather.desc}`}).css('width','50px'));
    currTempFieldEl.text(`Temperature: ${main.temp} \u00B0F`);
    currHumidFieldEl.text(`Humidity: ${main.humidity}%`);
    currWindFieldEl.text(`Wind Speed: ${wind.speed} MPH`);
    currUvIndFieldEl.text('UV Index: ');
    let bgColor = '';
    if (uvIndex.uvi >= 0 && uvIndex.uvi < 3) {
        bgColor = 'green';
    } else if (uvIndex.uvi >= 3 && uvIndex.uvi < 6) {
        bgColor = 'yellow'
    } else if (uvIndex.uvi >= 6 && uvIndex.uvi < 8) {
        bgColor = 'orange';
    } else if (uvIndex.uvi >= 8 && uvIndex.uvi < 11) {
        bgColor = 'red';
    } else {
        bgColor = 'purple';
    }
    currUvIndFieldEl.append($('<span>').addClass('uv').css('background-color',`${bgColor}`));
    $('.uv').text(`${uvIndex.uvi}`);

}



// form submit handler
formSearchEl.on('submit', formSubmitHandler);