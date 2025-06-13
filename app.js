async function getWeather() {
  console.log("getWeather called");
  const city = document.getElementById("city").value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

  try {
    const geoResponse = await fetch(geocodeUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error("City not found");
    }

    const { latitude, longitude, name, country, timezone } = geoData.results[0];
    console.log(`Found location: ${name}, ${country} (lat: ${latitude}, lon: ${longitude})`);

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=${timezone}`;

    const weatherResponse = await fetch(weatherUrl);
    const weatherData = await weatherResponse.json();

    if (!weatherData.current_weather) {
      throw new Error("Weather data not found");
    }

    const weather = weatherData.current_weather;
    const weatherDescription = getWeatherDescription(weather.weathercode);
    const iconPath = `media/icons/${weatherDescription.toLowerCase()}.png`;

    console.log("Weather description:", weatherDescription);

    // Update DOM
    document.getElementById("location").innerText = `${name}, ${country}`;
    document.getElementById("temp-text").innerText = `${weather.temperature}°C`;
    document.getElementById("icon").src = iconPath;
    document.getElementById("icon").alt = weatherDescription;
    document.getElementById("description").innerText = `${weatherDescription}`;
    document.getElementById("wind").innerText = `Wind Speed: ${weather.windspeed} km/h`;

    // Show the weather results container
    document.getElementById("weather-result").style.display = "block";

    // Start live local time clock
    startLocalTimeClock(timezone);

    // Update effect
    updateWeatherEffect(weatherDescription.toLowerCase());

  } catch (error) {
    alert("Error: " + error.message);
  }
}

// Live updating local time function
function startLocalTimeClock(timezone) {
  function updateTime() {
    const now = new Date();
    const localTime = now.toLocaleTimeString('en-US', { timeZone: timezone });
    document.getElementById('local-time').innerText = `Local Time: ${localTime}`;
  }
  clearInterval(window.localTimeInterval); // clear previous timer if any
  updateTime(); // show immediately
  window.localTimeInterval = setInterval(updateTime, 1000); // update every second
}

// Map Open-Meteo weather codes to descriptions
function getWeatherDescription(code) {
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "Rainy";
  if ([0, 1, 2].includes(code)) return "Sunny";
  if ([45, 48].includes(code)) return "Foggy";
  if ([3].includes(code)) return "Cloudy";
  return "Windy";
}

// Update body class for background effects
function updateWeatherEffect(description) {
  document.body.classList.remove("rain", "sunny", "breeze");

  if (description === "rainy") {
    document.body.classList.add("rain");
  } else if (description === "sunny") {
    document.body.classList.add("sunny");
  } else {
    document.body.classList.add("breeze");
  }
}

// Toggle Dark/Light mode
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}
