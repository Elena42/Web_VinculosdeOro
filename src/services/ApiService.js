const ApiService = {
    async getEventos() {
      const response = await fetch('/api/eventos'); // Ruta API para obtener eventos
      if (!response.ok) {
        throw new Error('Error al cargar eventos');
      }
      return response.json();
    },
  
    async actualizarAsistenciaEvento(idEvento, asistir) {
      const response = await fetch(`/api/eventos/${idEvento}/asistencia`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asistir }),
      });
      if (!response.ok) {
        throw new Error('Error al actualizar la asistencia');
      }
    },
  
    async getSolicitudes() {
      const response = await fetch('/api/solicitudes'); // Ruta API para obtener solicitudes
      if (!response.ok) {
        throw new Error('Error al cargar solicitudes');
      }
      return response.json();
    },
  
    async manejarSolicitud(idSolicitud, aceptada) {
      const response = await fetch(`/api/solicitudes/${idSolicitud}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ aceptada }),
      });
      if (!response.ok) {
        throw new Error('Error al manejar la solicitud');
      }
    },
  
    async getSugerencias() {
      const response = await fetch('/api/sugerencias'); // Ruta API para obtener sugerencias
      if (!response.ok) {
        throw new Error('Error al cargar sugerencias');
      }
      return response.json();
    },
  
    async marcarSugerenciaCompletada(idSugerencia) {
      const response = await fetch(`/api/sugerencias/${idSugerencia}/completada`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Error al marcar sugerencia como completada');
      }
    },
  };
  
  export default ApiService;
  