// Build a query URL for location name to get coordinates for the second query
// Send query to get coordinates
function getCoordinates(city) {
    const queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=c5699847454ceaee90306cc232d7b9bb";

    return fetch(queryURL)
        .then(response => response.json())
        .then(data => {
            console.log('API Response:', data);  // Log the response for inspection

            if (data && data.coord && data.coord.lat && data.coord.lon) {
                const coordinates = {
                    lat: data.coord.lat,
                    lon: data.coord.lon
                };
                return coordinates;
            } else {
                throw new Error('Invalid response format for coordinates');
            }
        })
        .catch(error => console.error('Error fetching coordinates:', error));
}

// Build a query URL for weather data using coordinates from the previous query
// Send query for weather data
function getWeatherData(coordinates) {
    if (!coordinates || !coordinates.lat || !coordinates.lon) {
        throw new Error('Invalid coordinates provided for weather data');
    }

    const queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly&appid=c5699847454ceaee90306cc232d7b9bb`;

    return fetch(queryURL)
        .then(response => response.json())
        .then(data => {
            if (data) {
                return data;
            } else {
                throw new Error('Invalid response format for weather data');
            }
        })
        .catch(error => console.error('Error fetching weather data:', error));
}

// Build an element to hold/show the current data
// Find a place in the DOM to attach a new element (with id "today")
function displayCurrentData(data) {
    const todayElement = document.getElementById('today');
    todayElement.innerHTML = '';

    if (data && data.name && data.dt && data.weather && data.main && data.wind) {
        const cityName = data.name;
        const date = new Date(data.dt * 1000).toLocaleDateString();
        const weatherIcon = data.weather[0].icon;
        const temperature = data.main.temp;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;

        todayElement.innerHTML = `
            <h2>${cityName}</h2>
            <p>Date: ${date}</p>
            <p>Icon: ${weatherIcon}</p>
            <p>Temperature: ${temperature}°C</p>
            <p>Humidity: ${humidity}%</p>
            <p>Wind Speed: ${windSpeed} m/s</p>
        `;
    } else {
        console.error('Invalid response format for current weather data:', data);
        todayElement.innerHTML = '<p>Error: Unable to display current weather data</p>';
    }
};

// For loop over the weather data from the forecast API
// Build elements for the 5-day forecast
// Find a place in the DOM to attach new elements (with id "forecast")
function displayForecast(data) {
    const forecastElement = document.getElementById('forecast');
    forecastElement.innerHTML = '<h3>5-Day Forecast</h3>';

    if (data && data.forecast && Array.isArray(data.forecast)) {
        for (const day of data.forecast) {
            const dayElement = document.createElement('div');
            dayElement.innerHTML = `
                <p>Date: ${day.date}</p>
                <p>Icon: ${day.weatherIcon}</p>
                <p>Temperature: ${day.temperature}°C</p>
                <p>Humidity: ${day.humidity}%</p>
                <hr class="hr weather-hr" />
            `;
            forecastElement.appendChild(dayElement);
        }
    } else {
        console.error('Invalid response format for weather forecast data:', data);
        forecastElement.innerHTML = '<p>Error: Unable to display weather forecast data</p>';
    }
};

// "Submit" function to initiate the API calls when the button is clicked
// Take value from input, save to local storage, and use in API call for coordinates
document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const city = document.getElementById('search-input').value;

    // Save city to local storage
    saveToLocalStorage(city);

    // Initiate API calls
    getCoordinates(city)
        .then(coordinates => getWeatherData(coordinates))
        .then(weatherData => {
            // Display current data
            displayCurrentData(weatherData.current);

            // Display 5-day forecast
            displayForecast(weatherData);
        })
        .catch(error => console.error('Error processing weather data:', error));
});

// Function to save city to local storage
function saveToLocalStorage(city) {
    let searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
    searchHistory.push(city);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
};
