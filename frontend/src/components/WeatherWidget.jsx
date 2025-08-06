import React from 'react';
import { Cloud, Sun, CloudRain, CloudLightning } from 'lucide-react';

const WeatherWidget = () => {
  // Simulação de dados de clima
  const weatherData = {
    temperature: 24,
    description: 'Parcialmente nublado',
    humidity: 65,
    windSpeed: 12
  };

  const getWeatherIcon = () => {
    if (weatherData.description.includes('nublado')) return <Cloud size={32} />;
    if (weatherData.description.includes('sol')) return <Sun size={32} />;
    if (weatherData.description.includes('chuva')) return <CloudRain size={32} />;
    if (weatherData.description.includes('tempestade')) return <CloudLightning size={32} />;
    return <Sun size={32} />;
  };

  return (
    <div className="weather-widget widget-hover-effect">
      <div className="weather-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          {getWeatherIcon()}
          <div>
            <div className="weather-temp">{weatherData.temperature}°C</div>
            <div className="weather-desc">{weatherData.description}</div>
          </div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
          <div>
            <div style={{ opacity: 0.8 }}>Umidade</div>
            <div style={{ fontWeight: 600 }}>{weatherData.humidity}%</div>
          </div>
          <div>
            <div style={{ opacity: 0.8 }}>Vento</div>
            <div style={{ fontWeight: 600 }}>{weatherData.windSpeed} km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget; 