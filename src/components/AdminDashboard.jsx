import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [eventos, setEventos] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editEventoId, setEditEventoId] = useState(null);
  const [newEvento, setNewEvento] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    fotoUrl: '',
    lugar: '',
    nparticipantes: Number,
    asistentes: Number,
    latitud: null,
    longitud: null
  });
  const [foto, setFoto] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const eventosSnapshot = await db.collection('Eventos').get();
        const sugerenciasSnapshot = await db.collection('Sugerencias').get();
        const solicitudesSnapshot = await db.collection('Solicitudes').get();

        setEventos(eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setSugerencias(sugerenciasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setSolicitudes(solicitudesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvento({ ...newEvento, [name]: value });
    // Limpiar errores del campo modificado
  setErrors(prevErrors => ({
    ...prevErrors,
    [name]: undefined
  }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFoto(e.target.files[0]);
    } else {
      setFoto(null); // Limpiar foto si no se selecciona ningún archivo
    }
  };

  const isValidDateFormat = (dateString) => {
    // Expresión regular para verificar el formato "dd/MM/yyyy HH:mm"
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4} ([01][0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(dateString);
  };


  const isValidDate = (dateString) => {
    const [day, month, year, hours, minutes] = dateString.split(/[\/: ]/).map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);
    return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day && 
           date.getHours() === hours && date.getMinutes() === minutes;
  };

  const validateFields = async() => {
    const errors = {};
    
    if (!newEvento.titulo) errors.titulo = 'Por favor introduzca el título';
    if (!newEvento.descripcion) errors.descripcion = 'Por favor introduzca la descripción';
    if (!newEvento.fecha) errors.fecha = 'Por favor introduzca la fecha';
    if (!isValidDateFormat(newEvento.fecha) || !isValidDate(newEvento.fecha)) {
      errors.fecha = 'La fecha debe estar en el formato "dd/MM/yyyy HH:mm" y ser una fecha válida';
    }
    if (!newEvento.lugar) errors.lugar = 'Por favor introduzca el lugar';
    if (!newEvento.nparticipantes || isNaN(newEvento.nparticipantes)) errors.nparticipantes = 'Por favor introduzca un número válido de participantes';
    try {
      const coordinates = await geocodeAddress(newEvento.lugar);
      if (!coordinates || !coordinates.latitud || !coordinates.longitud) {
        errors.lugar = 'Por favor seleccione una ubicación válida en Google Maps';
      } else {
        newEvento.latitud = coordinates.latitud;
        newEvento.longitud = coordinates.longitud;
      }
    } catch (error) {
      console.error('Error al validar la ubicación:', error.message); // Mensaje de error para depuración
      errors.lugar = 'Error al validar la ubicación. Inténtelo de nuevo.';
    }

    return errors;
  };

  const geocodeAddress = async (direccion) => {
    const apiKey = 'AIzaSyBwN4qDYd6i1KqVNuccuW1gWpFC7xPjQI0'; 
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${apiKey}`);
      const data = await response.json();
      console.log('Geocoding response:', data); // Imprime la respuesta para depuración
  
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          latitud: location.lat,
          longitud: location.lng,
        };
      } else {
        console.error('Error en la respuesta de la API:', data.status, data.error_message); // Mensaje de error en caso de respuesta negativa
        throw new Error('No se pudo obtener la latitud y longitud para la dirección proporcionada.');
      }
    } catch (error) {
      console.error('Error en la geocodificación:', error);
      throw new Error('Error al obtener latitud y longitud.');
    }
  };

 /*
  // Función para realizar geocodificación y obtener latitud y longitud
  const geocodeAddress = async (direccion) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        console.log('Geocoding result:', data[0]);
        return {
          latitud: parseFloat(data[0].lat),
          longitud: parseFloat(data[0].lon),
        };
      } else {
        throw new Error('No se pudo obtener la latitud y longitud para la dirección proporcionada.');
      }
    } catch (error) {
      console.error('Error en la geocodificación:', error);
      throw new Error('Error al obtener latitud y longitud.');
    }
  };*/

  const handleCreateEvento = async (e) => {
    e.preventDefault();
    const fieldErrors = await validateFields();
    if(Object.keys(fieldErrors).length>0){
      setErrors(fieldErrors);
      return;
    }
    try {
      
  
      let fotoUrl = '';
  
      // Subir foto si se seleccionó alguna
      if (foto) {
        const storageRef = storage.ref();
        const fotoRef = storageRef.child(`eventos/${foto.name}`);
        await fotoRef.put(foto);
        fotoUrl = await fotoRef.getDownloadURL();
      }
  
      // Obtener coordenadas basadas en la dirección ingresada
      const coordinates = await geocodeAddress(newEvento.lugar);
  
      // Verificar que se obtuvieron las coordenadas correctamente
      if (!coordinates || !coordinates.latitud || !coordinates.longitud) {
        setErrors({ lugar: 'Por favor seleccione una ubicación válida en Google Maps' });
        return;
      }
  
      const eventoData = {
        titulo: newEvento.titulo,
        descripcion: newEvento.descripcion,
        fecha: newEvento.fecha,
        fotoUrl: fotoUrl,
        lugar: newEvento.lugar,
        nparticipantes: Number(newEvento.nparticipantes),
        asistentes: 0,
        latitud: coordinates.latitud,
        longitud: coordinates.longitud
      };
  
      // Guardar evento en Firestore
      await db.collection('Eventos').add(eventoData);
  
      // Actualizar lista de eventos
      const eventosSnapshot = await db.collection('Eventos').get();
      setEventos(eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  
      // Limpiar formulario y estado de foto
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Error al crear evento:", error);
    }
  };
  
  const handleDeleteEvento = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este evento?')) {
      try {
        await db.collection('Eventos').doc(id).delete();
        const eventosSnapshot = await db.collection('Eventos').get();
        setEventos(eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error al eliminar evento:", error);
      }
    }
  };

  const handleEditEvento = (evento) => {
    setEditEventoId(evento.id);
    setNewEvento(evento); // Cargar el evento seleccionado en el formulario de edición
  };

  const handleUpdateEvento = async (e) => {
    e.preventDefault();
    const fieldErrors = await validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }
    try {
      const updatedEvento = { ...newEvento };
  
      // Si hay una nueva foto seleccionada, subirla y actualizar la URL
      if (foto) {
        const storageRef = storage.ref();
        const fotoRef = storageRef.child(`eventos/${foto.name}`);
        await fotoRef.put(foto);
        updatedEvento.fotoUrl = await fotoRef.getDownloadURL();
      }

      const coordinates = await geocodeAddress(updatedEvento.lugar);
      if (!coordinates || !coordinates.latitud || !coordinates.longitud) {
        setErrors({ lugar: 'Por favor seleccione una ubicación válida en Google Maps' });
        return;
      }
      updatedEvento.latitud = coordinates.latitud;
      updatedEvento.longitud = coordinates.longitud;

  
      // Actualizar solo los campos que han cambiado
      await db.collection('Eventos').doc(newEvento.id).update(updatedEvento);
  
      setEditEventoId(null);
      resetForm();
  
      // Actualizar lista de eventos
      const eventosSnapshot = await db.collection('Eventos').get();
      setEventos(eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error al actualizar evento:", error);
    }
  };
  

  const handleCancelEdit = () => {
    setEditEventoId(null);
    resetForm();
  };

  const handleAcceptSugerencia = async (sugerencia) => {
    if (window.confirm('¿Está seguro de que desea aceptar esta sugerencia?')) {
      try {
        const coordinates = await geocodeAddress(sugerencia.lugar);

        if (!coordinates || !coordinates.latitud || !coordinates.longitud) {
          console.error("No se pudieron obtener las coordenadas.");
          return;
        }
        // Ajustar la transformación de la sugerencia en un evento
        const eventoData = {
          titulo: sugerencia.titulo,
          descripcion: sugerencia.descripcion,
          fecha: sugerencia.fecha,
          lugar: sugerencia.lugar,
          nparticipantes: sugerencia.nparticipantes,
          asistentes: 0, // Iniciar con 0 asistentes
          latitud: coordinates.latitud,
          longitud: coordinates.longitud
        };
  
        // Guardar el nuevo evento en la colección "Eventos"
        await db.collection('Eventos').add(eventoData);
  
        // Eliminar la sugerencia aceptada
        await db.collection('Sugerencias').doc(sugerencia.id).delete();
  
        // Actualizar las listas de sugerencias y eventos
        const sugerenciasSnapshot = await db.collection('Sugerencias').get();
        setSugerencias(sugerenciasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  
        const eventosSnapshot = await db.collection('Eventos').get();
        setEventos(eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error al aceptar sugerencia:", error);
      }
    }
  };
  

  const handleRejectSugerencia = async (id) => {
    if (window.confirm('¿Está seguro de que desea rechazar esta sugerencia?')){
    try {
      await db.collection('Sugerencias').doc(id).delete();
      const sugerenciasSnapshot = await db.collection('Sugerencias').get();
      setSugerencias(sugerenciasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error al rechazar sugerencia:", error);
    }
  }
  };

  const handleAcceptSolicitud = async (solicitud) => {
    if (window.confirm('¿Está seguro de que desea aceptar este Administrador?')) {
      try {
        // Guardar el documento en la colección "Administradores" usando el mismo ID del documento en "Solicitudes"
        await db.collection('Administradores').doc(solicitud.id).set({
          ...solicitud,
          aprobado: true
        });
  
        // Eliminar el documento de la colección "Solicitudes"
        await db.collection('Solicitudes').doc(solicitud.id).delete();
  
        // Obtener y actualizar el estado con las solicitudes restantes
        const solicitudesSnapshot = await db.collection('Solicitudes').get();
        setSolicitudes(solicitudesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  
      } catch (error) {
        console.error("Error al aceptar solicitud:", error);
      }
    }
  };
  

  const handleRejectSolicitud = async (id) => {
    if (window.confirm('¿Está seguro de que desea rechazar este Administrador?')){
    try {
      await db.collection('Solicitudes').doc(id).delete();
      const solicitudesSnapshot = await db.collection('Solicitudes').get();
      setSolicitudes(solicitudesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error al rechazar solicitud:", error);
    }
  }
  };

  const handleCerrarSesion = () => {
    
    console.log("Cerrando sesión...");
    navigate('/loginAdmins'); // Redirigir al usuario a la página de loginAdmins
  };

  const resetForm = () => {
    setNewEvento({
      titulo: '',
      descripcion: '',
      fecha: '',
      fotoUrl: '',
      lugar: '',
      nparticipantes: Number,
      latitud: null,
      longitud: null
    });
    setFoto(null);
    setErrors({});
  };
 

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <button onClick={handleCerrarSesion} className="cerrar-sesion">Cerrar Sesión</button>
        </div>
        <div className="admin-header-right">
          <p>Vínculos de Oro</p>
        </div>
      </header>
      <div className="admin-sections">
        <div className="section eventos">
          <h2>EVENTOS</h2>
          <button onClick={() => setShowForm(!showForm)} className="primary-button">{showForm ? 'Cancelar' : 'Crear Evento'}</button>
          {showForm && (
            <form onSubmit={handleCreateEvento} className="form">
              <input type="text" name="titulo" placeholder="Título" value={newEvento.titulo} onChange={handleInputChange} />
              {errors.titulo && <span className="error-message">{errors.titulo}</span>}

              <textarea name="descripcion" placeholder="Descripción" value={newEvento.descripcion} onChange={handleInputChange}></textarea>
              {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}

              <input type="text" name="fecha" placeholder="Fecha (dd/mm/yyyy hh:mm)" value={newEvento.fecha} onChange={handleInputChange} />
              {errors.fecha && <span className="error-message">{errors.fecha}</span>}
              
              
              <input type="text" name="lugar" placeholder="Lugar" value={newEvento.lugar} onChange={handleInputChange}  />
              {errors.lugar && <span className="error-message">{errors.lugar}</span>}
              
              
              
              <input type="number" name="nparticipantes" placeholder="Número de participantes" value={newEvento.nparticipantes} onChange={handleInputChange}  />
              {errors.nparticipantes && <span className="error-message">{errors.nparticipantes}</span>}

              <input type="file" onChange={handleFileChange} />
              
              <button type="submit" className="primary-button">Crear Evento</button>
            </form>
          )}
          {eventos.map(evento => (
            <div key={evento.id} className="item">
              {editEventoId === evento.id ? (
                <form onSubmit={handleUpdateEvento} className="form">
                  <input type="text" name="titulo" placeholder="Título" value={newEvento.titulo} onChange={handleInputChange} required />
                  {errors.titulo && <span className="error-message">{errors.titulo}</span>}

                  <textarea name="descripcion" placeholder="Descripción" value={newEvento.descripcion} onChange={handleInputChange} required></textarea>
                   {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
                  
                  <input type="text" name="fecha" placeholder="Fecha (dd/mm/yyyy hh:mm)" value={newEvento.fecha} onChange={handleInputChange} required />
                  {errors.fecha && <span className="error-message">{errors.fecha}</span>}
                  
                  <input type="file" onChange={handleFileChange} />
                  {errors.foto && <span className="error-message">{errors.foto}</span>}

                  <input type="text" name="lugar" placeholder="Lugar" value={newEvento.lugar} onChange={handleInputChange} required />
                  {errors.lugar && <span className="error-message">{errors.lugar}</span>}
                  
                  <input type="number" name="nparticipantes" placeholder="Número de participantes" value={newEvento.nparticipantes} onChange={handleInputChange} required />
                  {errors.nparticipantes && <span className="error-message">{errors.nparticipantes}</span>}

                  <button type="submit" className="primary-button">Actualizar</button>
                  <button type="button" className="cancel-button" onClick={handleCancelEdit}>Cancelar</button>
                </form>
              ) : (
                <>
                  <h3>{evento.titulo}</h3>
                  <img src={evento.fotoUrl}  alt="" className="evento-imagen" />
                  <p>{evento.descripcion}</p>
                  <p>Fecha: {evento.fecha}</p>
                  <p>Lugar: {evento.lugar}</p>
                  <p>Asistentes: {evento.asistentes}</p>
                  <p>Número de participantes: {evento.nparticipantes}</p>
                  <button onClick={() => handleEditEvento(evento)} className="primary-button">Editar</button>
                  <button onClick={() => handleDeleteEvento(evento.id)} className="danger-button">Eliminar</button>
                </>
              )}
            </div>
          ))}
        </div>
        <div className="section sugerencias">
        {errors.general && <div className="error-message">{errors.general}</div>}
          <h2>SUGERENCIAS</h2>
          {sugerencias.map(sugerencia => (
            <div key={sugerencia.id} className="item">
              <h3>{sugerencia.titulo}</h3>
              <p>{sugerencia.descripcion}</p>
              {sugerencia.fecha && <p>Fecha: {sugerencia.fecha}</p>}
              {sugerencia.lugar && <p>Lugar: {sugerencia.lugar}</p>}
              {sugerencia.nparticipantes && <p>Número de participantes: {sugerencia.nparticipantes}</p>}
              <button onClick={() => handleAcceptSugerencia(sugerencia)} className="primary-button">Aceptar</button>
              <button onClick={() => handleRejectSugerencia(sugerencia.id)} className="danger-button">Rechazar</button>
            </div>
          ))}
        </div>
        <div className="section solicitudes">
          <h2>SOLICITUDES</h2>
          {solicitudes.map(solicitud => (
            <div key={solicitud.id} className="item">
              <h3>{solicitud.nombre}</h3>
              <p>{solicitud.email}</p>
              <button onClick={() => handleAcceptSolicitud(solicitud)} className="primary-button">Aceptar</button>
              <button onClick={() => handleRejectSolicitud(solicitud.id)} className="danger-button">Rechazar</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
