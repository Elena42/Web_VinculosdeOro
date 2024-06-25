import { useNavigate } from 'react-router-dom'; // Importamos useNavigate en lugar de useHistory
import firebase from '../firebase';

const SettingsIcon = () => {
  const navigate = useNavigate(); // Usamos useNavigate para la navegación

  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      navigate('/login-admins'); // Navegamos a la página de inicio de sesión para administradores
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="settings-icon">
      <button onClick={handleLogout}>
        <i className="fas fa-cog"></i> Cerrar Sesión
      </button>
    </div>
  );
};

export default SettingsIcon;
