import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

const Sugerencias = () => {
  const [sugerencias, setSugerencias] = useState([]);

  useEffect(() => {
    cargarSugerencias();
  }, []);

  const cargarSugerencias = async () => {
    try {
      const sugerenciasData = await ApiService.getSugerencias();
      setSugerencias(sugerenciasData);
    } catch (error) {
      console.error('Error al cargar sugerencias:', error);
    }
  };

  const handleAceptarSugerencia = async (idSugerencia) => {
    try {
      const sugerencia = sugerencias.find(s => s.id_sugerencia === idSugerencia);
      await ApiService.aceptarSugerencia(sugerencia);
      cargarSugerencias(); // Recargar la lista de sugerencias después de aceptar una
    } catch (error) {
      console.error('Error al aceptar sugerencia:', error);
    }
  };

  const handleRechazarSugerencia = async (idSugerencia) => {
    if (window.confirm('¿Estás seguro de que deseas rechazar esta sugerencia?')) {
      try {
        await ApiService.eliminarSugerencia(idSugerencia);
        cargarSugerencias(); // Recargar la lista de sugerencias después de eliminar una
      } catch (error) {
        console.error('Error al rechazar sugerencia:', error);
      }
    }
  };

  return (
    <div>
      <h2>Sugerencias</h2>
      <ul>
        {sugerencias.map(sugerencia => (
          <li key={sugerencia.id_sugerencia}>
            <h3>{sugerencia.titulo}</h3>
            <p>{sugerencia.descripcion}</p>
            <button onClick={() => handleAceptarSugerencia(sugerencia.id_sugerencia)}>Aceptar</button>
            <button onClick={() => handleRechazarSugerencia(sugerencia.id_sugerencia)}>Rechazar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sugerencias;
