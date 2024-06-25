import React, { useState, useEffect } from 'react';
import ApiService from '../services/ApiService';

const Solicitud = () => {
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  const cargarSolicitudes = async () => {
    try {
      const solicitudesData = await ApiService.getSolicitudes();
      setSolicitudes(solicitudesData);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
    }
  };

  const handleAprobarSolicitud = async (idSolicitud) => {
    try {
      const solicitud = solicitudes.find(s => s.id_solicitud === idSolicitud);
      await ApiService.aprobarSolicitud(solicitud);
      cargarSolicitudes(); // Recargar la lista de solicitudes después de aprobar una
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
    }
  };

  const handleRechazarSolicitud = async (idSolicitud) => {
    if (window.confirm('¿Estás seguro de que deseas rechazar esta solicitud?')) {
      try {
        await ApiService.eliminarSolicitud(idSolicitud);
        cargarSolicitudes(); // Recargar la lista de solicitudes después de eliminar una
      } catch (error) {
        console.error('Error al rechazar solicitud:', error);
      }
    }
  };

  return (
    <div>
      <h2>Solicitudes</h2>
      <ul>
        {solicitudes.map(solicitud => (
          <li key={solicitud.id_solicitud}>
            <h3>{solicitud.titulo}</h3>
            <p>{solicitud.descripcion}</p>
            <button onClick={() => handleAprobarSolicitud(solicitud.id_solicitud)}>Aprobar</button>
            <button onClick={() => handleRechazarSolicitud(solicitud.id_solicitud)}>Rechazar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Solicitud;
