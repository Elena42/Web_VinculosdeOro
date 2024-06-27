import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import './SplashScreen.css';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const [animationData, setAnimationData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar la animación desde la carpeta public
    const fetchAnimationData = async () => {
      try {
        const response = await fetch('/vinculosintro.json');
        const data = await response.json();
        setAnimationData(data);
      } catch (error) {
        console.error("Error loading animation:", error);
      }
    };

    fetchAnimationData();

    // Configurar el temporizador para redirigir a la página de login
    const timer = setTimeout(() => {
      navigate('/login-admins');
    }, 12300);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      {animationData ? (
        <Lottie animationData={animationData} autoplay loop style={{ width: '100%', height: 'auto' }} />
      ) : (
        <p>Cargando...</p>
      )}
      <h1>Vínculos de Oro</h1>
    </div>
  );
};

export default SplashScreen;
