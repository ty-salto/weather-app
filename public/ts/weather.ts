console.log("JS loaded"); // <-- Do you see this in the browser console?

const baseWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const baseGeoUrl = 'http://api.openweathermap.org/geo/1.0/direct';
const form = document.getElementById("weather-form") as HTMLFormElement | null;
const weatherDisplay = document.getElementById("weatherDisplay") as HTMLDivElement;
const getLocationBtn = document.getElementById("getLocationBtn") as HTMLButtonElement | null;

if (form) {
    form.addEventListener("submit", submitPost)
}

if (getLocationBtn) {
    getLocationBtn.addEventListener("click", getPostGeo)
}

async function submitPost (e: SubmitEvent) {
    e.preventDefault();
    console.log("working");

    const cityInput = document.getElementById("cityInput") as HTMLInputElement | null;

    if (!cityInput) {
        showError('Please enter a city name.');
        return;
    }

    const city = cityInput.value.trim();

    if (!city) {
        showError('Please enter a city name.');
        return;
    }


    try {
        const res = await fetch("/api/weather", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city}),
        });
    
        const data = await res.json();
    
        if (!res.ok || data.cod && data.cod !== 200) {
          showError(data.message || "Could not fetch weather data.");
          return;
        }
    
        displayWeather(data);
    
      } catch (err) {
        showError("Something went wrong. Please try again later.");
        console.error("Fetch failed:", err);
      }

}

async function getPostGeo (e: Event) {
    e.preventDefault();
    
    if (!navigator.geolocation) {
        showError("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
  
            try {
                const res = await fetch("/api/weathergeo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lat: latitude, lon: longitude }),
                });
  
                const data = await res.json();
  
                if (!res.ok || data.code && data.code !== 200) {
                    showError(data.message || "Could not fetch weather.");
                    return;
                }
  
                displayWeather(data);
            } catch (err) {
                console.error("Geolocation weather error:", err);
            showError("Failed to fetch weather from location.");
            }
        }, 
        () => {
            showError("Permission denied or failed to get location.");
        }
    );

}

function showError(message: string) {
    weatherDisplay.innerHTML = `<p class="text-red-500">${message}</p>`;
}


function displayWeather(data: any) {
    weatherDisplay.innerHTML = `
      <h2 class="text-2xl font-bold text-gray-800 mb-2">${data.name}</h2>
      <img class="mx-auto" src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="Weather icon">
      
      <p class="text-lg text-gray-700 mt-2"><strong>Temperature:</strong> ${data.main.temp} °C</p>
      <p class="text-lg text-gray-700"><strong>Feels like:</strong> ${data.main.feels_like} °C</p>
      <p class="text-lg text-gray-700"><strong>Condition:</strong> ${data.weather[0].description}</p>

      <div class="grid grid-cols-2 gap-4 text-left mt-6 text-gray-700">
        <div><strong>Humidity:</strong> ${data.main.humidity}%</div>
        <div><strong>Pressure:</strong> ${data.main.pressure} hPa</div>
        <div><strong>Wind:</strong> ${data.wind.speed} m/s</div>
      </div>
    `;
}
