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
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch forecast');
            }
            return response.json();
        })
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

    const icon = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    const temperature = `${Math.round(data.main.temp)}${currentUnit === 'metric' ? '°C' : '°F'}`;
    const description = data.weather[0].description;
    const humidity = `${data.main.humidity}%`;
    const windSpeed = `${data.wind.speed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}`;
    
    const date = new Date(data.dt * 1000).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    document.getElementById('date').textContent = date;
    document.getElementById('weather-icon').src = icon;
    document.getElementById('temperature').textContent = temperature;
    document.getElementById('description').textContent = description;
    document.getElementById('humidity').textContent = humidity;
    document.getElementById('wind-speed').textContent = windSpeed;
}

function displayForecast(data) {
    const forecastContainer = document.getElementById('forecast');
    forecastContainer.innerHTML = '';

    const days = {};
    data.list.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const day = date.toLocaleDateString(undefined, { weekday: 'long' });

        if (!days[day]) {
            days[day] = {
                date: date,
                temp: forecast.main.temp,
                icon: forecast.weather[0].icon,
                description: forecast.weather[0].description
            };
        }
    });

    Object.values(days).slice(0, 7).forEach(forecast => { // Show next 7 days
        const day = forecast.date.toLocaleDateString(undefined, { weekday: 'long' });
        const temp = `${Math.round(forecast.temp)}${currentUnit === 'metric' ? '°C' : '°F'}`;
        const icon = `http://openweathermap.org/img/wn/${forecast.icon}.png`;
        const description = forecast.description;

        const forecastElement = document.createElement('div');
        forecastElement.classList.add('forecast-item');

        const dayElement = document.createElement('div');
        dayElement.classList.add('forecast-day');
        dayElement.textContent = day;

        const iconElement = document.createElement('img');
        iconElement.classList.add('forecast-icon');
        iconElement.src = icon;

        const tempElement = document.createElement('div');
        tempElement.classList.add('forecast-temp');
        tempElement.textContent = temp;

        const descriptionElement = document.createElement('div');
        descriptionElement.classList.add('forecast-description');
        descriptionElement.textContent = description;

        forecastElement.appendChild(dayElement);
        forecastElement.appendChild(iconElement);
        forecastElement.appendChild(tempElement);
        forecastElement.appendChild(descriptionElement);

        forecastContainer.appendChild(forecastElement);
    });
}

function displayError(message) {
    document.getElementById('weather-box').style.display = 'none';
    document.getElementById('weather-details').style.display = 'none';
    document.getElementById('not-found').style.display = 'block';
    document.getElementById('error-message').textContent = message;
}

function updateTemperatureUnit(unit) {
    currentUnit = unit;
    const location = document.getElementById('location-input').value;
    if (location) {
        fetchWeatherData(location);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const locationInput = document.getElementById('location-input');
    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const location = locationInput.value;
            if (location) {
                fetchWeatherData(location);
            }
        }
    });
});
