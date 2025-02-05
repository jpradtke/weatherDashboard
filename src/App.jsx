import { useState, useEffect } from "react";
import { SunIcon, CloudIcon } from "@heroicons/react/24/solid";

const API_KEY = "c400f45e3244f2a402126e8477f70b17"; // Replace with your API key
const DEFAULT_CITY = "Berlin";

function getDailyForecast(forecastList) {
  const dailyData = {};

  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!dailyData[date]) {
      dailyData[date] = [];
    }
    dailyData[date].push(item);
  });

  const dailyForecast = Object.keys(dailyData).map((date) => {
    const forecasts = dailyData[date];
    const noonForecast = forecasts.find((f) => new Date(f.dt * 1000).getHours() === 12);
    return noonForecast || forecasts[0];
  });

  dailyForecast.sort((a, b) => a.dt - b.dt);
  return dailyForecast;
}

function getWeatherIcon(weatherCondition) {
  if (!weatherCondition) return <CloudIcon className="h-16 w-16 text-gray-500" />;
  if (weatherCondition.includes("clear")) return <SunIcon className="h-16 w-16 text-yellow-500" />;
  if (weatherCondition.includes("snow")) return <CloudSnowIcon className="h-16 w-16 text-blue-300" />;
  return <CloudIcon className="h-16 w-16 text-gray-500" />;
}

function Weather() {
  const [city, setCity] = useState(DEFAULT_CITY);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeather(DEFAULT_CITY);
  }, []);

  function fetchWeather(cityName) {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch weather data.");
          return response.json();
        }),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`)
        .then((response) => {
          if (!response.ok) throw new Error("Failed to fetch forecast.");
          return response.json();
        })
    ])
      .then(([weatherData, forecastData]) => {
        setWeather(weatherData);
        setForecast(forecastData.list);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg shadow-md flex items-center w-full max-w-md">
        <input
          type="text"
          placeholder="Enter city..."
          className="flex-1 p-2 text-lg border-none outline-none"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          onClick={() => fetchWeather(city)}
        >
          Search
        </button>
      </div>

      {/* Weather Card */}
      <div className="bg-white p-10 rounded-lg shadow-lg text-center mt-6 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-gray-800">{weather ? weather.name : "City"}</h1>

        {loading && <p className="text-gray-500 mt-4">Loading...</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}

        {weather && !loading && (
          <div className="mt-6">
            {getWeatherIcon(weather.weather[0]?.description)}
            <p className="text-xl text-gray-700 font-semibold mt-2">🌡️ {weather.main.temp}°C</p>
            <p className="text-lg text-gray-600 mt-2">🌬️ {weather.wind.speed} m/s</p>
            <p className="text-lg text-gray-600 mt-2">💧 {weather.main.humidity}%</p>
            <p className="text-lg text-gray-600 mt-2 capitalize">🌍 {weather.weather[0]?.description}</p>
          </div>
        )}
      </div>

      {/* 5-Day Forecast */}
{getDailyForecast(forecast).length > 0 && (
  <div className="mt-6 w-full max-w-md">
    <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">5-Day Forecast</h2>
    <div className="grid grid-cols-5 gap-2">
      {getDailyForecast(forecast).map((day, index) => (
        <div key={index} className="bg-gray-100 p-4 rounded-lg text-center">
          <p className="font-semibold">
            {new Date(day.dt * 1000).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </p>
          <p className="text-gray-700">🌡 {Math.round(day.main.temp)}°C</p>
          <p className="text-gray-600 capitalize">{day.weather[0]?.description}</p>
        </div>
      ))}
    </div>
  </div>
)}


    </div>
  );
}

export default function App() {
  return <Weather />;
}
