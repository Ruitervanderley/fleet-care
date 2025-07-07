import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const EquipmentHistoryModal = ({ tag, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tag) return;
    setLoading(true);
    axios.get(`http://localhost:8000/equipment/${tag}`)
      .then(res => {
        setData(res.data);
        setError(null);
      })
      .catch(err => {
        setError('Erro ao carregar histórico');
      })
      .finally(() => setLoading(false));
  }, [tag]);

  if (!tag) return null;

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content modal-fade" style={{ background: '#fff', borderRadius: 16, padding: '36px 40px 32px 40px', minWidth: 340, maxWidth: 540, width: '95vw', boxShadow: '0 8px 32px rgba(80,80,120,0.18)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#6366f1', padding: 4, borderRadius: 8, transition: 'background 0.2s' }} title="Fechar">
          <X size={22} />
        </button>
        <h2 style={{ marginBottom: 18, fontSize: 24, color: '#4f46e5', fontWeight: 700, textAlign: 'left' }}>Histórico de Manutenções</h2>
        {loading && <div style={{textAlign: 'center', padding: 24}}>Carregando...</div>}
        {error && <div style={{ color: '#e53e3e', textAlign: 'center', padding: 24 }}>{error}</div>}
        {data && (
          <>
            <div style={{ marginBottom: 20, background: '#f3f4f6', borderRadius: 8, padding: 16, fontSize: 15 }}>
              <strong>TAG:</strong> {data.tag}<br />
              <strong>Tipo:</strong> {data.tipo}<br />
              <strong>Intervalo:</strong> {data.intervalo}<br />
              <strong>Última Manutenção:</strong> {data.ultima_manut}<br />
              <strong>Atual:</strong> {data.atual}
            </div>
            <div style={{overflowX: 'auto'}}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, background: '#fff' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: 10, borderBottom: '1px solid #e2e8f0', color: '#4f46e5', fontWeight: 700 }}>Data</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #e2e8f0', color: '#4f46e5', fontWeight: 700 }}>Horímetro/KM</th>
                  </tr>
                </thead>
                <tbody>
                  {data.historico.length === 0 && (
                    <tr><td colSpan={2} style={{ textAlign: 'center', color: '#a0aec0', padding: 18 }}>Sem lançamentos recentes</td></tr>
                  )}
                  {data.historico.map((item, idx) => (
                    <tr key={idx} style={{background: idx % 2 === 0 ? '#fff' : '#f9fafb'}}>
                      <td style={{ padding: 10, borderBottom: '1px solid #f1f1f1' }}>{item.data}</td>
                      <td style={{ padding: 10, borderBottom: '1px solid #f1f1f1' }}>{item.h_final}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EquipmentHistoryModal; 