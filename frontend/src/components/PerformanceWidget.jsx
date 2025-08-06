import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Zap } from 'lucide-react';

const PerformanceWidget = () => {
  const [performance, setPerformance] = useState(0);

  useEffect(() => {
    // Simulação de animação de performance
    const timer = setTimeout(() => {
      setPerformance(85);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const performanceData = {
    efficiency: 85,
    uptime: 92,
    productivity: 78,
    quality: 96
  };

  return (
    <div className="performance-widget widget-hover-effect">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Zap size={24} />
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Performance da Frota</h3>
      </div>

      <div className="performance-chart">
        <div className="performance-bar">
          <div 
            className="performance-fill"
            style={{ width: `${performance}%` }}
          />
        </div>
        <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '1.5rem', fontWeight: 700 }}>
          {performance}%
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {performanceData.efficiency}%
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Eficiência</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {performanceData.uptime}%
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Uptime</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {performanceData.productivity}%
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Produtividade</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {performanceData.quality}%
          </div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Qualidade</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceWidget; 