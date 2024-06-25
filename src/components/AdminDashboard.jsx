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
    nparticipantes: 0,
    asistentes: 0,
    lista_asistentes: [],
    latitud: null,
    longitud: null
  });
  const [foto, setFoto] = useState(null);
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
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFoto(e.target.files[0]);
    } else {
      setFoto(null); // Limpiar foto si no se selecciona ningún archivo
    }
  };
  

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
  };

  const handleCreateEvento = async (e) => {
    e.preventDefault();
    try {
      // Validar que todos los campos requeridos estén completos
      if (!newEvento.titulo || !newEvento.descripcion || !newEvento.fecha || !newEvento.lugar || !newEvento.nparticipantes) {
        console.error("Por favor complete todos los campos requeridos.");
        return;
      }
  
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
        console.error("No se pudieron obtener las coordenadas.");
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
        lista_asistentes: [],
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
    try {
      const updatedEvento = { ...newEvento };
  
      // Si hay una nueva foto seleccionada, subirla y actualizar la URL
      if (foto) {
        const storageRef = storage.ref();
        const fotoRef = storageRef.child(`eventos/${foto.name}`);
        await fotoRef.put(foto);
        updatedEvento.fotoUrl = await fotoRef.getDownloadURL();
      }
  
      // Actualizar solo los campos que han cambiado
      await db.collection('Eventos').doc(newEvento.id).update({
        titulo: updatedEvento.titulo,
        descripcion: updatedEvento.descripcion,
        fecha: updatedEvento.fecha,
        fotoUrl: updatedEvento.fotoUrl,
        asistentes:updatedEvento.asistentes,
        lugar: updatedEvento.lugar,
        nparticipantes: Number(updatedEvento.nparticipantes),
        latitud: updatedEvento.latitud,
        longitud: updatedEvento.longitud
      });
  
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
    if (window.confirm('¿Está seguro de que desea aceptar esta sugerencia?')){
      try {
        await db.collection('Eventos').add(sugerencia);
        await db.collection('Sugerencias').doc(sugerencia.id).delete();
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
    if (window.confirm('¿Está seguro de que desea aceptar este Administrador?')){
    try {
      await db.collection('Administradores').add({ ...solicitud, aprobado: true });
      await db.collection('Solicitudes').doc(solicitud.id).delete();
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
      nparticipantes: 0,
      asistentes: 0,
      lista_asistentes: [],
      latitud: null,
      longitud: null
    });
    setFoto(null);
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
              <input type="text" name="titulo" placeholder="Título" value={newEvento.titulo} onChange={handleInputChange} required />
              <textarea name="descripcion" placeholder="Descripción" value={newEvento.descripcion} onChange={handleInputChange} required></textarea>
              <input type="text" name="fecha" placeholder="Fecha (dd/mm/yyyy hh:mm)" value={newEvento.fecha} onChange={handleInputChange} required />
              <input type="file" onChange={handleFileChange} />
              <input type="text" name="lugar" placeholder="Lugar" value={newEvento.lugar} onChange={handleInputChange} required />
              <input type="number" name="asistentes" placeholder="Asistentes" value={newEvento.asistentes} onChange={handleInputChange} required />
              <input type="number" name="nparticipantes" placeholder="Número de participantes" value={newEvento.nparticipantes} onChange={handleInputChange} required />
              <button type="submit" className="primary-button">Crear Evento</button>
            </form>
          )}
          {eventos.map(evento => (
            <div key={evento.id} className="item">
              {editEventoId === evento.id ? (
                <form onSubmit={handleUpdateEvento} className="form">
                  <input type="text" name="titulo" placeholder="Título" value={newEvento.titulo} onChange={handleInputChange} required />
                  <textarea name="descripcion" placeholder="Descripción" value={newEvento.descripcion} onChange={handleInputChange} required></textarea>
                  <input type="text" name="fecha" placeholder="Fecha (dd/mm/yyyy hh:mm)" value={newEvento.fecha} onChange={handleInputChange} required />
                  <input type="file" onChange={handleFileChange} />
                  <input type="text" name="lugar" placeholder="Lugar" value={newEvento.lugar} onChange={handleInputChange} required />
                  <input type="number" name="asistentes" placeholder="Asistentes" value={newEvento.asistentes} onChange={handleInputChange} required />
                  <input type="number" name="nparticipantes" placeholder="Número de participantes" value={newEvento.nparticipantes} onChange={handleInputChange} required />
                  <button type="submit" className="primary-button">Actualizar</button>
                  <button type="button" className="cancel-button" onClick={handleCancelEdit}>Cancelar</button>
                </form>
              ) : (
                <>
                  <h3>{evento.titulo}</h3>
                  <img src={evento.fotoUrl} alt={evento.titulo} className="evento-imagen" />
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
          <h2>SUGERENCIAS</h2>
          {sugerencias.map(sugerencia => (
            <div key={sugerencia.id} className="item">
              <h3>{sugerencia.titulo}</h3>
              <p>{sugerencia.descripcion}</p>
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
