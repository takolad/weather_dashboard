// HTML Element Handlers
var formSearchEl = $('.searchForm');
var currTempFieldEl = $('.temperature');
var currCityDateFieldEl = $('.cityDate');
var currHumidFieldEl = $('.humidity');
var currWindFieldEl = $('.wind');
var currUvIndFieldEl = $('.uvIndex');
var currWeatherIconEl = $('weatherIcon');
var weatherHistoryEl = $('.historyList');
var dayOneEl = $('.dayOne');
var dayTwoEl = $('.dayTwo');
var dayThreeEl = $('.dayThree');
var dayFourEl = $('.dayFour');
var dayFiveEl = $('.dayFive');
var allWeatherEl = $('.allWeather');

// needs to be obscured at some point (from public)
var key = '5414d0440b699cd577aca3c70d52067f';

// to hold city information
var cityName = "";
var cityNameUri = "";
var coord = {
    lon: 0,
    lat: 0,
};
// to hold current weather information
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
var timeZone = 0;

// will hold the 5 day weather information
var fiveDayStats = [
    {
        date: "",
        icon: "",
        desc: "",
        temp: 0,
        humidity: 0,
    },
    {
        date: "",
        icon: "",
        desc: "",
        temp: 0,
        humidity: 0,
    },
    {
        date: "",
        icon: "",
        desc: "",
        temp: 0,
        humidity: 0,
    },
    {
        date: "",
        icon: "",
        desc: "",
        temp: 0,
        humidity: 0,
    },
    {
        date: "",
        icon: "",
        desc: "",
        temp: 0,
        humidity: 0,
    },
]

// localStorage
var savedSearches = JSON.parse(localStorage.getItem('searches'));

if (typeof(savedSearches) === 'undefined' || savedSearches === null) {
    savedSearches = new Array();
} else {
    for (var i = savedSearches.length - 1; i >= 0; i--) {
        var listEl = $('<li>').attr('class', 'list-group-item').text(savedSearches[i]);
        weatherHistoryEl.append(listEl);
    }
}

//////////////////////////
// Open Weather Map API //
//////////////////////////

// owm - current weather api
var apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityNameUri}&units=imperial&appid=${key}`;
// owm - one call api (to get UV Index)
var apiUvUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude={minutely,hourly,daily,alerts}&units=imperial&appid=${key}`;
// owm - five day api
var apiFiveDayUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityNameUri}&units=imperial&appid=${key}`;
// owm - url for weather icon
var iconUrl = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;


var formSubmitHandler = function (event) {
    event.preventDefault();
    
    cityName = $('input[name="search"').val().trim();
    // if previously searched for, removes from array and pushes to the end so it is most recent search
    if (savedSearches.includes(cityName)) {
        var index = savedSearches.indexOf(cityName);
        savedSearches.splice(index, 1);
        savedSearches.push(cityName);
    } else {
        // if not already searched for adds to end of array
        savedSearches.push(cityName);
    }
    cityNameUri = cityName.replace(" ", "%20");
    getCurrentWeather();
    getWeeklyWeather();
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
                    timeZone = data.timezone;
                    apiUvUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude={minutely,hourly,daily,alerts}&units=imperial&appid=${key}`;
                    iconUrl = `http://openweathermap.org/img/wn/${weather.icon}@2x.png`;
                    weather.desc = data.weather[0].description;
                    getUvIndex(coord.lat, coord.lon);
                    displayCurrWeather();
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
    // Get|Set Date
    dt += timeZone; // adjusts for timezone
    let dtInMs = dt * 1000;
    const dateObject = new Date(dtInMs);
    var todaysDate = dateObject.toLocaleDateString({month: "numeric", day: "numeric", year: "numeric"});

    // sets up data to be appended to web page
    currCityDateFieldEl.text(`${cityName} (${todaysDate})`);
    currCityDateFieldEl.append($('<img>').attr({'src':`${iconUrl}`,'alt':`${weather.desc}`}).css('width','50px'));
    currTempFieldEl.text(`Temperature: ${main.temp} \u00B0F`);
    currHumidFieldEl.text(`Humidity: ${main.humidity}%`);
    currWindFieldEl.text(`Wind Speed: ${wind.speed} MPH`);
    currUvIndFieldEl.text('UV Index: ');

    // sets background color based off severity of UV
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
        bgColor = 'purple'; // training for Mars :P
    }
    currUvIndFieldEl.append($('<span>').addClass('uv').css('background-color',`${bgColor}`));
    $('.uv').text(`${uvIndex.uvi}`);

    // saves cities to localStorage
    localStorage.setItem('searches', JSON.stringify(savedSearches));
}

// displays 5 day weather
function getWeeklyWeather () {
    apiFiveDayUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityNameUri}&units=imperial&appid=${key}`;

    fetch(apiFiveDayUrl)
        .then(function (response) {
            if (response.ok) {
                response.json().then(function (data) {
                    /*
                        Time Zones complicate this section. Unsure how to logically/dynamically set first
                        result as the following day.
                    */
                    for (var i = 0, k = 0; i < 5; i++) {
                        // get|set date
                        let dt = data.list[k].dt;
                        dt += timeZone;
                        let dtInMs = dt * 1000;
                        const dateWkObject = new Date(dtInMs);

                        // sets weekly weather information
                        fiveDayStats[i].date = dateWkObject.toLocaleDateString({month: "numeric", day: "numeric", year: "numeric"});
                        fiveDayStats[i].icon = data.list[k].weather[0].icon;
                        fiveDayStats[i].desc = data.list[k].weather[0].description;
                        fiveDayStats[i].temp = data.list[k].main.temp;
                        fiveDayStats[i].humidity = data.list[k].main.humidity;
                        k += 8;
                    }
                    displayWeeklyWeather();
                });
            } else {
                alert('Error: ' + response.statusText);
            }
        })
        .catch(function (error) {
            alert('Unable to connect to Open Weather Map');
            });
    
    allWeatherEl.removeClass('d-none');
}

function displayWeeklyWeather () {
    for (var i = 0; i < 5; i++) {
        let weeklyDateEl = $('<h5>').attr('class',`day${i+1}Date`);
        let weeklyIconEl = $('<span>').attr('class',`day${i+1}Icon`);
        let weeklyIconUrl = `http://openweathermap.org/img/wn/${fiveDayStats[i].icon}@2x.png`;
        weeklyIconEl.append($('<img>').attr({'src':`${weeklyIconUrl}`,'alt':`${fiveDayStats[i].desc}`}).css('width','50px'));
        let weeklyTempEl = $('<span>').attr('class',`day${i+1}Temp`);
        let weeklyHumidEl = $('<span>').attr('class',`day${i+1}Humidity`);

        weeklyDateEl.text(fiveDayStats[i].date);
        weeklyTempEl.text(`Temp: ${fiveDayStats[i].temp} \u00B0F`)
        weeklyHumidEl.text(`Humidity: ${fiveDayStats[i].humidity}%`);

        // appends weather to matching element of [index to (day-1)]
        switch(i) {
            case 0:
                dayOneEl.text("");
                dayOneEl.append(weeklyDateEl);
                dayOneEl.append(weeklyIconEl);
                dayOneEl.append(weeklyTempEl);
                dayOneEl.append(weeklyHumidEl);
                break;
            case 1:
                dayTwoEl.text("");
                dayTwoEl.append(weeklyDateEl);
                dayTwoEl.append(weeklyIconEl);
                dayTwoEl.append(weeklyTempEl);
                dayTwoEl.append(weeklyHumidEl);
                break;
            case 2:
                dayThreeEl.text("");
                dayThreeEl.append(weeklyDateEl);
                dayThreeEl.append(weeklyIconEl);
                dayThreeEl.append(weeklyTempEl);
                dayThreeEl.append(weeklyHumidEl);
                break;
            case 3:
                dayFourEl.text("");
                dayFourEl.append(weeklyDateEl);
                dayFourEl.append(weeklyIconEl);
                dayFourEl.append(weeklyTempEl);
                dayFourEl.append(weeklyHumidEl);
                break;
            case 4:
                dayFiveEl.text("");
                dayFiveEl.append(weeklyDateEl);
                dayFiveEl.append(weeklyIconEl);
                dayFiveEl.append(weeklyTempEl);
                dayFiveEl.append(weeklyHumidEl);
                break;
        }
   }

}



// form submit handler
formSearchEl.on('submit', formSubmitHandler);

// click event handler
$(document).ready(function() {
    weatherHistoryEl.on('click', function (event) {
        cityName = event.target.textContent;
        cityNameUri = cityName.replace(" ", "%20");
        getCurrentWeather();
        getWeeklyWeather();
    });
});
