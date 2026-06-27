const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const temperature = document.getElementById('temperature');
const weatherDescription = document.getElementById('weather-description');
const humidityPercent = document.getElementById('humidity-percent');
const windSpeedEl = document.getElementById('wind-speed');
const feelsLike = document.getElementById('feels-like');
const windDirection = document.getElementById('wind-direction');
const uvIndex = document.getElementById('uv-index');
const sunriseEl = document.getElementById('sunrise');
const sunsetEl = document.getElementById('sunset');
const hourlyForecast = document.getElementById('hourly-forecast');
const dailyForecast = document.querySelector('.forecast-daily');
const alertsList = document.getElementById('alerts-list');
const enableNotificationsBtn = document.getElementById('enable-notifications');
const humidityCircle = document.getElementById('humidity-circle');
const turbineRotor = document.getElementById('turbine-rotor');
const celestialIcon = document.getElementById('celestial-icon');
const celestialIconExpanded = document.getElementById('celestial-icon-expanded');
const humidityDetail = document.getElementById('humidity-detail');
const uvDetail = document.getElementById('uv-detail');
const visibility = document.getElementById('visibility');
const cloudCover = document.getElementById('cloud-cover');
const windDetail = document.getElementById('wind-detail');
const windGusts = document.getElementById('wind-gusts');
const pressure = document.getElementById('pressure');
const comfortMoreBtn = document.getElementById('comfort-more-btn');
const comfortDetails = document.getElementById('comfort-details');
const windMoreBtn = document.getElementById('wind-more-btn');
const windDetailsExpanded = document.getElementById('wind-details-expanded');
const sunriseMoreBtn = document.getElementById('sunrise-more-btn');
const sunriseDetails = document.getElementById('sunrise-details');
const moonIcon = document.querySelector('.moon-icon');
const bgVideo = document.getElementById('bg-video');
const apiKey = 'c55c4cc2dfff05dafcd3ccaa6e2ab7f2';
const weatherBackgrounds = {
  clear: 'url("clear.jpeg")',
  clouds: 'url("clouds.jpeg")',
  rain: 'url("rainy.jpg")',
  thunderstorm: 'url("thunderstorm.jpg")',
  snow: 'url("snow.jpg")',
  mist: 'url("mist.jpg")',
  'broken cloude': 'url("broken-cloude.jpg")',
  default: 'url("clouds.jpeg")',
};
const weatherStickers = {
  clear: 'sun.png',
  clouds: 'clody sticker.png',
  rain: 'rainy sticker.jpg',
  thunderstorm: 'sticker thunder.webp',
  snow: 'sunny-and-rainy-cloudy-day-weather-forecast-icon-meteorological-sign-3d-render-png.webp',
  mist: 'mist.jpg',
  default: 'clouds.jpeg',
};

const map = L.map('map').setView([31.4167, 74.2667], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
let marker;
let locationTimezoneOffset = 0; // Global to store offset for formatting
let sunriseTimeMs = 0;
let sunsetTimeMs = 0;
function setBackground(weatherType) {
  const bgImage = weatherBackgrounds[weatherType.toLowerCase()] || weatherBackgrounds.default;
  document.body.style.backgroundImage = bgImage;
}
function formatDate(timestamp, offset) {
  const adjusted = new Date((timestamp + offset) * 1000);
  return new Intl.DateTimeFormat('en-US', { 
    timeZone: 'UTC',
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(adjusted);
}
function formatTime(timestamp, offset) {
  const adjusted = new Date((timestamp + offset) * 1000);
  return new Intl.DateTimeFormat('en-US', { 
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit'
  }).format(adjusted);
}
function celsiusToFahrenheit(c) {
  return Math.round((c * 9) / 5 + 32);
}
function getDirection(deg) {
  const val = Math.floor((deg / 22.5) + 0.5);
  const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return arr[(val % 16)];
}
async function getUV(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    const data = await response.json();
    const level = getUVLevel(data.value);
    uvIndex.textContent = `${data.value} ${level}`;
    uvDetail.textContent = `${data.value} ${level}`;
  } catch (error) {
    console.log('Error getting UV:', error);
    uvIndex.textContent = '-- Low';
    uvDetail.textContent = '-- Low';
  }
}
function getUVLevel(value) {
  if (value < 3) return 'Low';
  if (value < 6) return 'Moderate';
  if (value < 8) return 'High';
  if (value < 11) return 'Very High';
  return 'Extreme';
}
function updateCelestialPosition() {
  const now = Date.now(); // current time in ms
  const isDay = now >= sunriseTimeMs && now <= sunsetTimeMs;
  let progress;
  if (isDay) {
    celestialIcon.innerHTML = '☀️';
    celestialIconExpanded.innerHTML = '☀️';
    moonIcon.style.display = 'none';
    progress = (now - sunriseTimeMs) / (sunsetTimeMs - sunriseTimeMs);
    bgVideo.style.display = 'none';
    let bgKey = weatherDescription.textContent.toLowerCase().split(' ')[0] || 'default';
    setBackground(bgKey);
  } else {
    celestialIcon.innerHTML = '🌕';
    celestialIconExpanded.innerHTML = '🌕';
    moonIcon.style.display = 'block';
    const nextSunrise = sunriseTimeMs + 86400000; // next day
    progress = (now - sunsetTimeMs) / (nextSunrise - sunsetTimeMs);
    bgVideo.style.display = 'block';
    document.body.style.backgroundImage = 'none';
  }
  celestialIcon.style.setProperty('--position', `${progress * 100}%`);
  celestialIcon.style.display = 'block';
  celestialIconExpanded.style.setProperty('--position', `${progress * 100}%`);
  celestialIconExpanded.style.display = 'block';
}
function showWeather(data) {
  locationTimezoneOffset = data.timezone; // Store offset for all formatting
  cityName.textContent = data.name;
  currentDate.textContent = formatDate(data.dt, locationTimezoneOffset);
  temperature.textContent = celsiusToFahrenheit(data.main.temp) + '°F';
  weatherDescription.textContent = data.weather[0].description;
  humidityPercent.textContent = data.main.humidity + '%';
  humidityCircle.style.setProperty('--percent', data.main.humidity + '%');
  const windSpeedKmh = Math.round(data.wind.speed * 3.6);
  windSpeedEl.textContent = windSpeedKmh + ' km/h';
  feelsLike.textContent = celsiusToFahrenheit(data.main.feels_like) + '°F';
  windDirection.textContent = `${getDirection(data.wind.deg)} (${Math.round(data.wind.deg)}°)`;
  sunriseTimeMs = data.sys.sunrise * 1000;
  sunsetTimeMs = data.sys.sunset * 1000;
  sunriseEl.textContent = formatTime(data.sys.sunrise, locationTimezoneOffset);
  sunsetEl.textContent = formatTime(data.sys.sunset, locationTimezoneOffset);
  // Expanded details
  humidityDetail.textContent = data.main.humidity + '%';
  visibility.textContent = (data.visibility ? (data.visibility / 1000) + ' km' : '-- km');
  cloudCover.textContent = data.clouds.all + '%';
  windDetail.textContent = `${getDirection(data.wind.deg)} ${windSpeedKmh} km/h`;
  windGusts.textContent = data.wind.gust ? Math.round(data.wind.gust * 3.6) + ' km/h' : '-- km/h';
  pressure.textContent = data.main.pressure + ' hPa';
  // Animate turbine blades based on speed
  if (windSpeedKmh > 0) {
    const speed = Math.max(1, 20 / data.wind.speed);
    document.documentElement.style.setProperty('--rotation-speed', `${speed}s`);
    // Reverse direction if wind deg > 180 (example for direction-based)
    if (data.wind.deg > 180) {
      turbineRotor.style.animationDirection = 'reverse';
    } else {
      turbineRotor.style.animationDirection = 'normal';
    }
  } else {
    turbineRotor.style.animation = 'none';
  }
  updateCelestialPosition();
  // Update map
  map.setView([data.coord.lat, data.coord.lon], 10);
  if (marker) map.removeLayer(marker);
  marker = L.marker([data.coord.lat, data.coord.lon])
    .addTo(map)
    .bindPopup(`${data.name}`)
    .openPopup();
  getUV(data.coord.lat, data.coord.lon);
}
async function getWeather(city) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    if (data.cod !== 200) {
      throw new Error(data.message);
    }
    showWeather(data);
    getForecast(data.coord.lat, data.coord.lon);
    getAlerts(data.coord.lat, data.coord.lon);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}
async function getWeatherByLocation(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    showWeather(data);
    getForecast(lat, lon);
    getAlerts(lat, lon);
  } catch (error) {
    alert('Error getting weather for your location');
  }
}
async function getForecast(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    showForecast(data);
  } catch (error) {
    console.log('Error getting forecast:', error);
  }
}
function showForecast(data) {
  hourlyForecast.innerHTML = '';
  dailyForecast.innerHTML = '';
  // Hourly forecast: next 12
  for (let i = 0; i < Math.min(data.list.length, 12); i++) {
    const item = data.list[i];
    let dt = new Date(item.dt * 1000);
    const options = { hour: 'numeric', hour12: true };
    const timeString = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...options }).format(new Date((item.dt + locationTimezoneOffset) * 1000));
    const tempF = celsiusToFahrenheit(item.main.temp);
    const mainWeather = item.weather[0].main.toLowerCase();
    const sticker = weatherStickers[mainWeather] || weatherStickers.default;
    const clouds = item.clouds.all;
    const pop = Math.round(item.pop * 100);
    const sunny = 100 - clouds; // approximate sunny %
    hourlyForecast.innerHTML += `
      <div class="hourly-item" tabindex="0" aria-label="Forecast for ${timeString}, temperature ${tempF} degrees Fahrenheit, weather ${item.weather[0].description}">
        <div class="hourly-time">${timeString}</div>
        <img class="hourly-icon" src="${sticker}" alt="${item.weather[0].main}" />
        <div class="hourly-temp">${tempF}°F</div>
        <div class="hourly-clouds">Clouds: ${clouds}% (Sunny: ${sunny}%)</div>
        <div class="hourly-pop">Rain: ${pop}%</div>
      </div>
    `;
  }
  // Daily forecast
  let daysAdded = 0;
  const addedDates = new Set();
  for (let i = 0; i < data.list.length && daysAdded < 14; i++) {
    const listItem = data.list[i];
    if (listItem.dt_txt.includes('12:00:00')) {
      const dt = listItem.dt;
      const dayName = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' }).format(new Date((dt + locationTimezoneOffset) * 1000));
      const dateNum = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', day: 'numeric', month: 'numeric' }).format(new Date((dt + locationTimezoneOffset) * 1000));
      const tempMax = celsiusToFahrenheit(listItem.main.temp_max);
      const tempMin = celsiusToFahrenheit(listItem.main.temp_min);
      const mainWeather = listItem.weather[0].main.toLowerCase();
      const sticker = weatherStickers[mainWeather] || weatherStickers.default;
      const clouds = listItem.clouds.all;
      const pop = Math.round(listItem.pop * 100);
      const sunny = 100 - clouds;
      if (!addedDates.has(dateNum)) {
        dailyForecast.innerHTML += `
          <div class="forecast-item" tabindex="0" aria-label="${dayName} forecast: max ${tempMax} degrees Fahrenheit, min ${tempMin}">
            <div class="forecast-day">${dayName}</div>
            <div class="forecast-date">${dateNum}</div>
            <img class="forecast-icon" src="${sticker}" alt="${mainWeather}" />
            <div class="forecast-temp">${tempMax}° / ${tempMin}°F</div>
            <div class="forecast-clouds">Clouds: ${clouds}% (Sunny: ${sunny}%)</div>
            <div class="forecast-pop">Rain: ${pop}%</div>
          </div>
        `;
        daysAdded++;
        addedDates.add(dateNum);
      }
    }
  }
}
async function getAlerts(lat, lon) {
  alertsList.innerHTML = '';
  try {
    const response = await fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&latitude=${lat}&longitude=${lon}&maxradiuskm=100&limit=5`
    );
    const data = await response.json();
    data.features.forEach((eq) => {
      const mag = eq.properties.mag;
      const place = eq.properties.place;
      const time = new Date(eq.properties.time).toLocaleString();
      alertsList.innerHTML += `<div class="alert-item">Earthquake: ${mag} magnitude at ${place} on ${time}</div>`;
    });
  } catch (error) {
    console.log('Error fetching earthquakes:', error);
  }
  alertsList.innerHTML +=
    '<div class="alert-item">Weather Alerts: Check local news for severe weather.</div>';
}
enableNotificationsBtn.addEventListener('click', () => {
  if ('Notification' in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        alert('Notifications enabled!');
        new Notification('Weather Update', {
          body: `${cityName.textContent}: ${temperature.textContent}, ${weatherDescription.textContent}`,
        });
      }
    });
  } else {
    alert('Notifications not supported in this browser.');
  }
});
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        getWeatherByLocation(position.coords.latitude, position.coords.longitude);
      },
      () => {
        alert('Please allow location access or search by city');
      }
    );
  } else {
    alert('Your browser does not support location services');
  }
}
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) {
    getWeather(city);
  } else {
    alert('Please enter a city name');
  }
});
cityInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchBtn.click();
  }
});
locationBtn.addEventListener('click', getLocation);
// Navigation buttons for hourly
document.getElementById('hourly-left').addEventListener('click', () => {
  document.getElementById('hourly-wrapper').scrollLeft -= 100;
});
document.getElementById('hourly-right').addEventListener('click', () => {
  document.getElementById('hourly-wrapper').scrollLeft += 100;
});
// Navigation buttons for daily
document.getElementById('daily-left').addEventListener('click', () => {
  document.getElementById('daily-wrapper').scrollLeft -= 120;
});
document.getElementById('daily-right').addEventListener('click', () => {
  document.getElementById('daily-wrapper').scrollLeft += 120;
});
// Toggle expanded details
comfortMoreBtn.addEventListener('click', () => {
  comfortDetails.style.display = comfortDetails.style.display === 'block' ? 'none' : 'block';
});
windMoreBtn.addEventListener('click', () => {
  windDetailsExpanded.style.display = windDetailsExpanded.style.display === 'block' ? 'none' : 'block';
});
sunriseMoreBtn.addEventListener('click', () => {
  sunriseDetails.style.display = sunriseDetails.style.display === 'block' ? 'none' : 'block';
});
// Real-time update for celestial position every 60 seconds
setInterval(updateCelestialPosition, 60000);
// Initial load with Sialkot
getWeather('Sialkot');
