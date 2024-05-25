const apiKey = '395f846128aa892062eebabb84fddc55'; // Replace with your actual API key

document.getElementById('search-button').addEventListener('click', () => {
    const location = document.getElementById('location-input').value;
    fetchWeatherData(location);
});

document.getElementById('current-location-button').addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetchWeatherDataByCoords(latitude, longitude);
        }, () => {
            displayError('Unable to retrieve your location');
        });
    } else {
        displayError('Geolocation is not supported by this browser');
    }
});

document.getElementById('celsius-button').addEventListener('click', () => {
    updateTemperatureUnit('metric');
});

document.getElementById('fahrenheit-button').addEventListener('click', () => {
    updateTemperatureUnit('imperial');
});

let currentUnit = 'metric';

function fetchWeatherData(location) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=${currentUnit}`;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            fetchForecast(data.coord.lat, data.coord.lon);
        })
        .catch(error => {
            console.error(error);
            displayError('Invalid location');
        });
}

function fetchWeatherDataByCoords(latitude, longitude) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${currentUnit}`;
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            fetchForecast(data.coord.lat, data.coord.lon);
        })
        .catch(error => {
            console.error(error);
            displayError('Invalid location');
        });
}

function fetchForecast(lat, lon) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${currentUnit}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error(error);
            displayError('Unable to retrieve forecast');
        });
}

function displayWeather(data) {
    document.getElementById('not-found').style.display = 'none';
    document.getElementById('weather-box').style.display = 'block';
    document.getElementById('weather-details').style.display = 'flex';

    const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    const temperature = `${Math.round(data.main.temp)}${currentUnit === 'metric' ? '°C' : '°F'}`;
    const description = data.weather[0].description;
    const humidity = `${data.main.humidity}%`;
    const windSpeed = `${data.wind.speed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}`;

    document.getElementById('weather-icon').src = icon;
    document.getElementById('temperature').textContent = temperature;
    document.getElementById('description').textContent = description;
    document.getElementById('humidity').textContent = humidity;
    document.getElementById('wind-speed').textContent = windSpeed;
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    for (let i = 0; i < data.list.length; i += 8) { // 8 intervals per day
        const forecast = data.list[i];
        const date = new Date(forecast.dt_txt);
        const day = date.toLocaleDateString(undefined, { weekday: 'long' });
        const temp = `${Math.round(forecast.main.temp)}${currentUnit === 'metric' ? '°C' : '°F'}`;
        const icon = `http://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
        const description = forecast.weather[0].description;

        const forecastElement = document.createElement('div');
        forecastElement.classList.add('forecast-item');
        forecastElement.innerHTML = `
            <p>${day}</p>
            <img src="${icon}" alt="${description}">
            <p>${temp}</p>
            <p>${description}</p>
        `;
        forecastContainer.appendChild(forecastElement);
    }
}

function displayError(message) {
    document.getElementById('weather-box').style.display = 'none';
    document.getElementById('weather-details').style.display = 'none';
    document.getElementById('not-found').style.display = 'block';
    document.getElementById('not-found').textContent = message;
}

function updateTemperatureUnit(unit) {
    currentUnit = unit;
    const location = document.getElementById('location-input').value;
    if (location) {
        fetchWeatherData(location);
    }
}
