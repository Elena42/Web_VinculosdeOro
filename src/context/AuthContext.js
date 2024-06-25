// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; // Asegúrate de que Firebase está configurado correctamente

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const signup = (email, password) => {
    return auth.createUserWithEmailAndPassword(email, password);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
