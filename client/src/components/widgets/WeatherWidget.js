import React, { useState, useEffect } from 'react';
import '../../styles/Widgets.css';

const WMO_CODES = {
  0: { label: 'Clear Sky', icon: '☀️', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  1: { label: 'Mainly Clear', icon: '🌤️', bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  2: { label: 'Partly Cloudy', icon: '⛅', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  3: { label: 'Overcast', icon: '☁️', bg: 'linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)' },
  45: { label: 'Foggy', icon: '🌫️', bg: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)' },
  48: { label: 'Icy Fog', icon: '🌫️', bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  51: { label: 'Light Drizzle', icon: '🌦️', bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  53: { label: 'Moderate Drizzle', icon: '🌦️', bg: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' },
  61: { label: 'Light Rain', icon: '🌧️', bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  63: { label: 'Moderate Rain', icon: '🌧️', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  65: { label: 'Heavy Rain', icon: '🌧️', bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  71: { label: 'Light Snow', icon: '🌨️', bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  73: { label: 'Moderate Snow', icon: '❄️', bg: 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)' },
  75: { label: 'Heavy Snow', icon: '❄️', bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  80: { label: 'Rain Showers', icon: '🌦️', bg: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)' },
  81: { label: 'Heavy Showers', icon: '🌧️', bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  95: { label: 'Thunderstorm', icon: '⛈️', bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  96: { label: 'Thunderstorm with Hail', icon: '⛈️', bg: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)' },
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [unit, setUnit] = useState('C'); // C or F
  const [searchCity, setSearchCity] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const savedLocation = localStorage.getItem('weather_location');
    if (savedLocation) {
      const { lat, lon, city, country } = JSON.parse(savedLocation);
      fetchWeather(lat, lon, city, country);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await fetchLocationAndWeather(latitude, longitude);
        },
        () => {
          fetchDefaultWeather();
        }
      );
    } else {
      fetchDefaultWeather();
    }
  }, []);

  const fetchLocationAndWeather = async (lat, lon) => {
    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const geoData = await geoRes.json();
      const cityName = geoData.address?.city || geoData.address?.town || geoData.address?.state || 'Your Location';
      const countryName = geoData.address?.country || '';
      
      localStorage.setItem('weather_location', JSON.stringify({ lat, lon, city: cityName, country: countryName }));
      await fetchWeather(lat, lon, cityName, countryName);
    } catch (e) {
      setError('Unable to load location');
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lon, cityName, countryName) => {
    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=auto`
      );
      const data = await weatherRes.json();
      
      setWeather(data.current);
      setCity(cityName);
      setCountry(countryName);
      
      // Process daily forecast (next 7 days)
      const dailyForecast = data.daily.time.slice(1, 8).map((date, i) => ({
        date,
        weatherCode: data.daily.weather_code[i + 1],
        tempMax: data.daily.temperature_2m_max[i + 1],
        tempMin: data.daily.temperature_2m_min[i + 1],
        precipitation: data.daily.precipitation_sum[i + 1],
        precipProb: data.daily.precipitation_probability_max[i + 1],
        uvIndex: data.daily.uv_index_max[i + 1],
        windSpeed: data.daily.wind_speed_10m_max[i + 1],
      }));
      setForecast(dailyForecast);

      // Process hourly data (next 24 hours)
      const now = new Date();
      const currentHour = now.getHours();
      const hourly = data.hourly.time.slice(currentHour, currentHour + 24).map((time, i) => ({
        time,
        temp: data.hourly.temperature_2m[currentHour + i],
        weatherCode: data.hourly.weather_code[currentHour + i],
        precipitation: data.hourly.precipitation_probability[currentHour + i],
        windSpeed: data.hourly.wind_speed_10m[currentHour + i],
        humidity: data.hourly.relative_humidity_2m[currentHour + i],
        uvIndex: data.hourly.uv_index[currentHour + i],
      }));
      setHourlyData(hourly);

      setLoading(false);
    } catch (e) {
      setError('Unable to load weather');
      setLoading(false);
    }
  };

  const fetchDefaultWeather = async () => {
    await fetchWeather(28.6, 77.2, 'New Delhi', 'India');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchCity.trim()) return;

    setSearching(true);
    try {
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchCity)}&count=5&language=en&format=json`
      );
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setSearching(false);
    }
  };

  const selectLocation = async (result) => {
    setSearchResults([]);
    setSearchCity('');
    setLoading(true);
    await fetchWeather(result.latitude, result.longitude, result.name, result.country);
  };

  const convertTemp = (temp) => {
    if (unit === 'F') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const getUVLevel = (uv) => {
    if (uv <= 2) return { label: 'Low', color: '#28a745' };
    if (uv <= 5) return { label: 'Moderate', color: '#ffc107' };
    if (uv <= 7) return { label: 'High', color: '#fd7e14' };
    if (uv <= 10) return { label: 'Very High', color: '#dc3545' };
    return { label: 'Extreme', color: '#6f42c1' };
  };

  const getAQILevel = (humidity) => {
    // Simplified AQI based on humidity (for demo)
    if (humidity < 30) return { label: 'Dry', color: '#ffc107' };
    if (humidity < 60) return { label: 'Good', color: '#28a745' };
    if (humidity < 80) return { label: 'Moderate', color: '#17a2b8' };
    return { label: 'Humid', color: '#6c757d' };
  };

  if (loading) {
    return (
      <div className="widget widget--weather">
        <div className="widget__loading">
          <div className="weather__loader"></div>
          <p>Loading weather...</p>
        </div>
      </div>
    );
  }

  if (error) return null;
  if (!weather) return null;

  const condition = WMO_CODES[weather.weather_code] || { label: 'Unknown', icon: '🌡️', bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
  const uvLevel = getUVLevel(hourlyData[0]?.uvIndex || 0);
  const aqiLevel = getAQILevel(weather.relative_humidity_2m);

  return (
    <div className="widget widget--weather-enhanced" aria-label="Weather widget">
      {/* Header with Search */}
      <div className="weather__header">
        <div className="weather__location-info">
          <h3 className="weather__city">{city}</h3>
          <p className="weather__country">{country}</p>
        </div>
        <button 
          className="weather__search-toggle"
          onClick={() => setExpanded(!expanded)}
          aria-label="Toggle weather details"
        >
          {expanded ? '✕' : '🔍'}
        </button>
      </div>

      {/* Search Form */}
      {expanded && (
        <form className="weather__search-form" onSubmit={handleSearch}>
          <input
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            placeholder="Search city..."
            className="weather__search-input"
          />
          <button type="submit" className="weather__search-btn" disabled={searching}>
            {searching ? '...' : '🔍'}
          </button>
        </form>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="weather__search-results">
          {searchResults.map((result, i) => (
            <button
              key={i}
              className="weather__search-result"
              onClick={() => selectLocation(result)}
            >
              <span className="weather__result-name">{result.name}</span>
              <span className="weather__result-country">{result.country}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Weather Display */}
      <div className="weather__main-card" style={{ background: condition.bg }}>
        <div className="weather__main-content">
          <div className="weather__icon-large">{condition.icon}</div>
          <div className="weather__temp-section">
            <div className="weather__temp-display">
              <span className="weather__temp-large">{convertTemp(weather.temperature_2m)}</span>
              <div className="weather__unit-toggle">
                <button
                  className={`weather__unit-btn ${unit === 'C' ? 'active' : ''}`}
                  onClick={() => setUnit('C')}
                >
                  °C
                </button>
                <button
                  className={`weather__unit-btn ${unit === 'F' ? 'active' : ''}`}
                  onClick={() => setUnit('F')}
                >
                  °F
                </button>
              </div>
            </div>
            <p className="weather__condition-text">{condition.label}</p>
            <p className="weather__feels-like">
              Feels like {convertTemp(weather.apparent_temperature)}°{unit}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="weather__stats-grid">
        <div className="weather__stat">
          <span className="weather__stat-icon">💧</span>
          <div className="weather__stat-info">
            <span className="weather__stat-value">{weather.relative_humidity_2m}%</span>
            <span className="weather__stat-label">Humidity</span>
          </div>
        </div>
        <div className="weather__stat">
          <span className="weather__stat-icon">💨</span>
          <div className="weather__stat-info">
            <span className="weather__stat-value">{Math.round(weather.wind_speed_10m)} km/h</span>
            <span className="weather__stat-label">Wind {getWindDirection(weather.wind_direction_10m)}</span>
          </div>
        </div>
        <div className="weather__stat">
          <span className="weather__stat-icon">🌡️</span>
          <div className="weather__stat-info">
            <span className="weather__stat-value">{Math.round(weather.pressure_msl)} hPa</span>
            <span className="weather__stat-label">Pressure</span>
          </div>
        </div>
        <div className="weather__stat">
          <span className="weather__stat-icon">☁️</span>
          <div className="weather__stat-info">
            <span className="weather__stat-value">{weather.cloud_cover}%</span>
            <span className="weather__stat-label">Cloud Cover</span>
          </div>
        </div>
      </div>

      {/* UV Index & Air Quality */}
      <div className="weather__indicators">
        <div className="weather__indicator">
          <span className="weather__indicator-label">☀️ UV Index</span>
          <div className="weather__indicator-bar">
            <div 
              className="weather__indicator-fill" 
              style={{ width: `${Math.min((hourlyData[0]?.uvIndex || 0) * 10, 100)}%`, background: uvLevel.color }}
            />
          </div>
          <span className="weather__indicator-value" style={{ color: uvLevel.color }}>
            {hourlyData[0]?.uvIndex?.toFixed(1) || 0} - {uvLevel.label}
          </span>
        </div>
        <div className="weather__indicator">
          <span className="weather__indicator-label">🌫️ Air Quality</span>
          <div className="weather__indicator-bar">
            <div 
              className="weather__indicator-fill" 
              style={{ width: `${weather.relative_humidity_2m}%`, background: aqiLevel.color }}
            />
          </div>
          <span className="weather__indicator-value" style={{ color: aqiLevel.color }}>
            {aqiLevel.label}
          </span>
        </div>
      </div>

      {/* Hourly Forecast */}
      {expanded && hourlyData.length > 0 && (
        <div className="weather__hourly">
          <h4 className="weather__section-title">📊 Hourly Forecast</h4>
          <div className="weather__hourly-scroll">
            {hourlyData.slice(0, 12).map((hour, i) => {
              const hourCondition = WMO_CODES[hour.weatherCode] || condition;
              const time = new Date(hour.time);
              return (
                <div key={i} className="weather__hourly-item">
                  <span className="weather__hourly-time">
                    {time.getHours()}:00
                  </span>
                  <span className="weather__hourly-icon">{hourCondition.icon}</span>
                  <span className="weather__hourly-temp">{convertTemp(hour.temp)}°</span>
                  <span className="weather__hourly-precip">💧 {hour.precipitation}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7-Day Forecast */}
      {expanded && forecast.length > 0 && (
        <div className="weather__forecast">
          <h4 className="weather__section-title">📅 7-Day Forecast</h4>
          <div className="weather__forecast-list">
            {forecast.map((day, i) => {
              const dayCondition = WMO_CODES[day.weatherCode] || condition;
              const date = new Date(day.date);
              const dayName = i === 0 ? 'Tomorrow' : date.toLocaleDateString('en-US', { weekday: 'short' });
              return (
                <div key={i} className="weather__forecast-item">
                  <span className="weather__forecast-day">{dayName}</span>
                  <span className="weather__forecast-icon">{dayCondition.icon}</span>
                  <div className="weather__forecast-temps">
                    <span className="weather__forecast-high">{convertTemp(day.tempMax)}°</span>
                    <span className="weather__forecast-low">{convertTemp(day.tempMin)}°</span>
                  </div>
                  <span className="weather__forecast-precip">💧 {day.precipProb}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Toggle Details Button */}
      <button 
        className="weather__toggle-btn"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '▲ Show Less' : '▼ Show More Details'}
      </button>
    </div>
  );
}
