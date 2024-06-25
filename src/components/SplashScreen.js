import React, { useEffect } from 'react';
import Lottie from 'lottie-react';
import animationData from '../vinculosintro.json'; // Asegúrate de importar correctamente el archivo JSON de la animación
import './SplashScreen.css'; // Estilo opcional para el SplashScreen
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login-admins');
    }, 12300);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      <Lottie animationData={animationData} autoplay loop style={{ width: '100%', height: 'auto' }} />
      <h1>Vínculos de Oro</h1>
    </div>
  );
}

export default SplashScreen;
