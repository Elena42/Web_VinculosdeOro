import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase'; // Asegúrate de importar db y storage correctamente
import axios from 'axios'; // Necesitamos axios para las peticiones a la API de Google Maps

const CRUDEventos = () => {
  const [eventos, setEventos] = useState([]);
  const [formValues, setFormValues] = useState({
    asistentes: 0, // Asistentes inicializa en 0
    descripcion: "",
    fecha: "",
    fotoUrl: "",
    lugar: "",
    nparticipantes: 0, // Número de participantes inicializa en 0
    titulo: ""
  });
  const [imagenEvento, setImagenEvento] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null); // Para previsualizar la imagen actual

  useEffect(() => {
    cargarEventos();
  }, []);

  const cargarEventos = async () => {
    try {
      const eventosSnapshot = await db.collection('Eventos').get(); // Cambiar 'eventos' por 'Eventos'
      const listaEventos = eventosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEventos(listaEventos);
    } catch (error) {
      console.error("Error al cargar eventos:", error);
    }
  };

  const handleModificar = (evento) => {
    setFormValues({
      asistentes: evento.asistentes || 0, // Aseguramos que asistentes esté inicializado
      descripcion: evento.descripcion,
      fecha: evento.fecha,
      fotoUrl: evento.fotoUrl,
      lugar: evento.lugar,
      nparticipantes: evento.nparticipantes || 0, // Aseguramos que nparticipantes esté inicializado
      titulo: evento.titulo,
      id: evento.id
    });
    setImagenPreview(evento.fotoUrl); // Mostrar la imagen actual del evento para previsualización
  };

  const handleGuardarCambios = async () => {
    try {
      let fotoUrl = formValues.fotoUrl;

      if (imagenEvento) {
        const storageRef = storage.ref();
        const imagenRef = storageRef.child(`eventos/${imagenEvento.name}`);
        await imagenRef.put(imagenEvento);
        fotoUrl = await imagenRef.getDownloadURL();
      }

      // Obtener latitud y longitud desde la dirección utilizando la API de Google Maps
      const direccion = formValues.lugar;
      const apiKey = 'AIzaSyBwN4qDYd6i1KqVNuccuW1gWpFC7xPjQI0'; // Reemplaza con tu API Key de Google Maps
      const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(direccion)}&key=${apiKey}`;

      const response = await axios.get(geocodingUrl);
      const location = response.data.results[0]?.geometry.location || { lat: 0, lng: 0 };

      const eventoData = {
        asistentes: formValues.asistentes || 0,
        descripcion: formValues.descripcion,
        fecha: formValues.fecha,
        fotoUrl: fotoUrl,
        latitud: location.lat,
        lista_asistentes: [], // Lista de asistentes vacía
        longitud: location.lng,
        lugar: formValues.lugar,
        nparticipantes: formValues.nparticipantes || 0,
        titulo: formValues.titulo
      };

      if (formValues.id) {
        await db.collection('Eventos').doc(formValues.id).update(eventoData); // Cambiar 'eventos' por 'Eventos'
      } else {
        const newEventoRef = await db.collection('Eventos').add(eventoData); // Cambiar 'eventos' por 'Eventos'
        eventoData.id = newEventoRef.id;
      }

      cargarEventos();
      resetForm();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
    }
  };

  const handleImagenChange = (e) => {
    if (e.target.files[0]) {
      setImagenEvento(e.target.files[0]);
      setImagenPreview(URL.createObjectURL(e.target.files[0])); // Actualizar la previsualización con la nueva imagen seleccionada
    }
  };

  const resetForm = () => {
    setFormValues({
      asistentes: 0, // Reiniciar asistentes a 0
      descripcion: "",
      fecha: "",
      fotoUrl: "",
      lugar: "",
      nparticipantes: 0, // Reiniciar nparticipantes a 0
      titulo: ""
    });
    setImagenEvento(null);
    setImagenPreview(null); // Limpiar la previsualización de la imagen
  };

  return (
    <div className="crud-eventos">
      <h2>CRUD de Eventos</h2>
      <div className="eventos-list">
        {eventos.map(evento => (
          <div key={evento.id} className="evento">
            <h3>{evento.titulo}</h3>
            <p>Nombre: {evento.titulo}</p>
            <p>Asistentes: {evento.asistentes}</p>
            <p>Descripción: {evento.descripcion}</p>
            <p>Fecha: {evento.fecha}</p>
            {evento.fotoUrl && <img src={evento.fotoUrl} alt="Foto del evento" className="evento-imagen" />} {/* Mostrar la imagen del evento si existe */}
            <p>Latitud: {evento.latitud}</p>
            <p>Longitud: {evento.longitud}</p>
            <p>Lugar: {evento.lugar}</p>
            <p>Número de Participantes: {evento.nparticipantes}</p>
            <button onClick={() => handleModificar(evento)}>Modificar</button>
          </div>
        ))}
      </div>
      <h2>Modificar Evento</h2>
      <form>
        <label>
          Asistentes:
          <input type="number" value={formValues.asistentes} onChange={(e) => setFormValues({ ...formValues, asistentes: e.target.value })} />
        </label>
        <label>
          Descripción:
          <textarea value={formValues.descripcion} onChange={(e) => setFormValues({ ...formValues, descripcion: e.target.value })} />
        </label>
        <label>
          Fecha:
          <input type="text" value={formValues.fecha} onChange={(e) => setFormValues({ ...formValues, fecha: e.target.value })} />
        </label>
        <label>
          Foto:
          <input type="file" onChange={handleImagenChange} />
        </label>
        {imagenPreview && <img src={imagenPreview} alt="Previsualización de la imagen" className="imagen-preview" />} {/* Previsualización de la imagen */}
        <label>
          Lugar:
          <input type="text" value={formValues.lugar} onChange={(e) => setFormValues({ ...formValues, lugar: e.target.value })} />
        </label>
        <label>
          Número de Participantes:
          <input type="number" value={formValues.nparticipantes} onChange={(e) => setFormValues({ ...formValues, nparticipantes: e.target.value })} />
        </label>
        <label>
          Título:
          <input type="text" value={formValues.titulo} onChange={(e) => setFormValues({ ...formValues, titulo: e.target.value })} />
        </label>
        <button type="button" onClick={handleGuardarCambios}>Guardar Cambios</button>
      </form>
    </div>
  );
};

export default CRUDEventos;
