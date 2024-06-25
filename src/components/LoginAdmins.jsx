import React, { useState } from 'react';
import './Login.css';
import { auth, db } from '../firebase'; // Asegúrate de que la importación de db está correctamente configurada
import { useNavigate } from 'react-router-dom';

const LoginAdmins = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;

    try {
      // Autenticar usuario
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      const userId = userCredential.user.uid;

      // Obtener datos del administrador desde Firestore
      const adminDoc = await db.collection('Administradores').doc(userId).get();

      if (adminDoc.exists) {
        const adminData = adminDoc.data();

        // Verificar si el administrador está aprobado
        if (adminData.aprobado) {
          console.log('Inicio de sesión exitoso para el administrador:', email);
          navigate('/admin-dashboard'); // Redirigir al administrador a la página de eventos
        } else {
          alert('Tu cuenta no está aprobada para ingresar.');
        }
      } else {
        alert('Administrador no encontrado en la base de datos.');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      alert('Ocurrió un error al iniciar sesión. Verifica tus credenciales.');
    }
  };
 



 
  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-content">
        <h2>Iniciar sesión</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <input id="usuario" type="text" placeholder="Correo" />
          </div>
          <div className="form-group">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
            />
          </div>
          <div className="form-group">
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="showPassword"
                checked={showPassword}
                onChange={handleTogglePassword}
                className="toggle-password-checkbox"
              />
              <label htmlFor="showPassword" className="checkbox-label">
                Mostrar contraseña
              </label>
            </div>
          </div>
          <button type="submit" className="login-button">Ingresar</button>
        </form>
        <p className="register-text">
          <span>¿No tienes cuenta?{' '}</span>
          <a className="register-link" href="/registro-admins">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );




};


export default LoginAdmins;
