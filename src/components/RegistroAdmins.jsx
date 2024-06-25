import React, { useState } from 'react';
import { auth, db } from '../firebase';
import './Registro.css';
import { useNavigate } from 'react-router-dom';

const RegistroAdmins = () => {
  const [formData, setFormData] = useState({
    correo: '',
    contraseña: '',
    confirmarContraseña: '',
    direccion: '',
    nombre: '',
    rol: 'admin', // Asegúrate de que coincida con el rol esperado en Firestore (en minúsculas)
  });
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Función para manejar el cambio de los campos del formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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

  // Función para manejar el registro de un nuevo administrador
  const handleRegister = async (e) => {
    e.preventDefault();

    const { correo, contraseña, confirmarContraseña, direccion, nombre, rol } = formData;

    // Verificar que las contraseñas coinciden
    if (contraseña !== confirmarContraseña) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      console.log('Intentando geocodificar la dirección:', direccion);
      // Geocodificar la dirección para obtener latitud y longitud
      const { latitud, longitud } = await geocodeAddress(direccion);
      console.log('Latitud y longitud obtenidas:', { latitud, longitud });

      console.log('Intentando crear la cuenta en Firebase Auth con correo:', correo);
      // Crear cuenta de usuario en Firebase Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(correo, contraseña);
      const userId = userCredential.user.uid;
      console.log('Usuario creado con ID:', userId);

      console.log('Intentando guardar los datos en la colección Solicitudes');
      // Almacenar los datos del administrador en Firestore en la colección "Solicitudes"
      await db.collection('Solicitudes').doc(userId).set({
        aprobado: false,
        confirmarContraseña: confirmarContraseña, // No es necesario almacenar, pero lo hacemos según el ejemplo
        contraseña: contraseña,
        correo: correo,
        direccion: direccion,
        latitud: latitud,
        longitud: longitud,
        nombre: nombre,
        rol: rol,
      });

      console.log('Datos de solicitud guardados en Firestore:', {
        aprobado: false,
        confirmarContraseña: confirmarContraseña,
        contraseña: contraseña,
        correo: correo,
        direccion: direccion,
        latitud: latitud,
        longitud: longitud,
        nombre: nombre,
        rol: rol,
      });

      // Redirigir a la página de login
      console.log('Redirigiendo a la página de login...');
      navigate('/login');

    } catch (error) {
      console.error('Error al registrar solicitud:', error);
      setError('Ocurrió un error al registrar. Por favor, verifica los detalles y vuelve a intentarlo.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-background"></div>
      <div className="register-content">
        <h2>Registro de Administradores</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <input
              id="correo"
              type="email"
              name="correo"
              placeholder="Correo"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              id="contraseña"
              type={showPassword ? "text" : "password"}
              name="contraseña"
              placeholder="Contraseña"
              value={formData.contraseña}
              onChange={handleChange}
              required
            />
          </div>
          <div className="checkbox-container">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
            <label className="checkbox-label">Mostrar contraseña</label>
          </div>
          <div className="form-group">
            <input
              id="confirmarContraseña"
              type={showPassword ? "text" : "password"}
              name="confirmarContraseña"
              placeholder="Confirmar Contraseña"
              value={formData.confirmarContraseña}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              id="direccion"
              type="text"
              name="direccion"
              placeholder="Dirección"
              value={formData.direccion}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              id="nombre"
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <input
              id="rol"
              type="text"
              name="rol"
              value={formData.rol}
              readOnly
            />
          </div>
          <button type="submit" className="register-button">Registrar</button>
        </form>
      </div>
    </div>
  );
};

export default RegistroAdmins;
