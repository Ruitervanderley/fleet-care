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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Histórico de Manutenções</h2>
          <button onClick={onClose} className="modal-close" title="Fechar">
            <X size={22} />
          </button>
        </div>
        <div className="modal-body">
          {loading && <div className="loading">Carregando...</div>}
          {error && <div className="alert alert-danger">{error}</div>}
          {data && (
            <>
              <div className="card" style={{ marginBottom: '1rem' }}>
                <strong>TAG:</strong> {data.tag}<br />
                <strong>Tipo:</strong> {data.tipo}<br />
                <strong>Intervalo:</strong> {data.intervalo}<br />
                <strong>Última Manutenção:</strong> {data.ultima_manut}<br />
                <strong>Atual:</strong> {data.atual}
              </div>
              <div className="table-container">
                <table className="equipment-table">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Horímetro/KM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.historico.length === 0 ? (
                      <tr>
                        <td colSpan="2" className="empty-state">Sem lançamentos recentes</td>
                      </tr>
                    ) : (
                      data.historico.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.data}</td>
                          <td>{item.h_final}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentHistoryModal; 