/**
 * FarmPulse - Weather API Service
 * Fetches data from Open-Meteo REST API
 */

const API_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

class WeatherAPI {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Fetches current weather and forecast
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Promise<Object>} Weather data object
   */
  async getWeatherData(lat, lon) {
    const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
    
    // Simple caching for 10 minutes to avoid hitting API too much during testing
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < 10 * 60 * 1000) {
        return data;
      }
    }

    try {
      const url = `${API_BASE_URL}?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relative_humidity_2m,precipitation_probability,soil_moisture_0_to_7cm&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,weathercode&timezone=auto`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Weather API request failed');
      }
      
      const data = await response.json();
      
      const processedData = this.processWeatherData(data);
      this.cache.set(cacheKey, { data: processedData, timestamp: Date.now() });
      
      return processedData;
    } catch (error) {
      console.error('Failed to fetch weather data:', error);
      // Return mock data for fallback offline support
      return this.getMockData();
    }
  }

  /**
   * Helper specifically for index.html to get just current conditions
   */
  async getCurrentWeather(lat, lon) {
    const data = await this.getWeatherData(lat, lon);
    return data.current;
  }

  processWeatherData(raw) {
    // Current hour index in hourly arrays
    const currentHourStr = raw.current_weather.time;
    const hourIndex = raw.hourly.time.findIndex(t => t === currentHourStr) || 0;
    
    // Map WMO codes to our readable formats
    const weatherInfo = this.getWeatherInfo(raw.current_weather.weathercode);
    
    // Process current
    const current = {
      temperature: Math.round(raw.current_weather.temperature),
      windSpeed: Math.round(raw.current_weather.windspeed),
      condition: weatherInfo.condition,
      icon: weatherInfo.icon,
      isDay: raw.current_weather.is_day === 1,
      // Get from hourly using current index
      humidity: Math.round(raw.hourly.relative_humidity_2m[hourIndex] || 50),
      precipProb: Math.round(raw.hourly.precipitation_probability[hourIndex] || 0),
      soilMoisture: raw.hourly.soil_moisture_0_to_7cm[hourIndex] 
        ? Math.round(raw.hourly.soil_moisture_0_to_7cm[hourIndex] * 100) 
        : 65 // mock if missing
    };

    // Process daily forecast
    const forecast = [];
    for (let i = 0; i < 7; i++) {
      if (!raw.daily.time[i]) continue;
      
      // Append T12:00:00 to force local time evaluation and prevent timezone date shifting
      const date = new Date(raw.daily.time[i] + 'T12:00:00');
      const wInfo = this.getWeatherInfo(raw.daily.weathercode[i]);
      
      forecast.push({
        date: date,
        dayName: i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' }),
        maxTemp: Math.round(raw.daily.temperature_2m_max[i]),
        minTemp: Math.round(raw.daily.temperature_2m_min[i]),
        precipProb: Math.round(raw.daily.precipitation_probability_max[i]),
        precipSum: raw.daily.precipitation_sum[i],
        condition: wInfo.condition,
        icon: wInfo.icon
      });
    }

    return { current, forecast };
  }

  getWeatherInfo(code) {
    // WMO Weather interpretation codes
    if (code === 0) return { condition: 'Clear', icon: '☀️' };
    if (code >= 1 && code <= 3) return { condition: 'Partly Cloudy', icon: '🌤️' };
    if (code >= 45 && code <= 48) return { condition: 'Fog', icon: '🌫️' };
    if (code >= 51 && code <= 57) return { condition: 'Drizzle', icon: '🌧️' };
    if (code >= 61 && code <= 67) return { condition: 'Rain', icon: '🌧️' };
    if (code >= 71 && code <= 77) return { condition: 'Snow', icon: '❄️' };
    if (code >= 80 && code <= 82) return { condition: 'Rain Showers', icon: '🌦️' };
    if (code >= 95 && code <= 99) return { condition: 'Thunderstorm', icon: '⛈️' };
    
    return { condition: 'Unknown', icon: '❓' };
  }

  getMockData() {
    return {
      current: {
        temperature: 28,
        windSpeed: 12,
        humidity: 64,
        precipProb: 15,
        soilMoisture: 60,
        condition: 'Clear',
        icon: '☀️',
        isDay: true
      },
      forecast: Array.from({length: 7}).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
          date: d,
          dayName: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
          maxTemp: 30 + Math.floor(Math.random() * 5 - 2),
          minTemp: 22 + Math.floor(Math.random() * 5 - 2),
          precipProb: Math.floor(Math.random() * 40),
          precipSum: 0,
          condition: 'Partly Cloudy',
          icon: '🌤️'
        };
      })
    };
  }
}

export const weatherApi = new WeatherAPI();
