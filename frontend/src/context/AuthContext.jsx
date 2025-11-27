import { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const item = window.localStorage.getItem("car-doba-user");
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error("Error al leer localStorage", error);
      return null;
    }
  });

  const navigate = useNavigate();

  const login = async (username, password) => {
    try {
      console.log("AuthContext: Iniciando login...");
      // Call the backend API
      const response = await axios.post("http://localhost:8000/auth/login", {
        username,
        password,
      });

      console.log("AuthContext: Respuesta bruta del servidor:", response.data);

      let responseData = response.data;

      // 1. Manejo de Array: Si el backend devuelve una lista [ {user} ], tomamos el primero
      if (Array.isArray(responseData)) {
        if (responseData.length > 0) {
          console.log(
            "AuthContext: La respuesta es un array, tomando el primer elemento."
          );
          responseData = responseData[0];
        } else {
          throw new Error("El servidor devolvió una lista vacía.");
        }
      }

      let userToStore = null;

      // Lógica de Normalización:
      // Caso A: Estructura que mostraste { userId: 2, employeeId: 1, ... }
      if (responseData.userId) {
        userToStore = {
          ...responseData,
          id: responseData.userId, // Normalizamos para que 'id' siempre exista
          token: responseData.token || "dummy-token", // Si no hay token, simulamos uno para que la app no falle
        };
      }
      // Caso B: El backend devuelve { id: 1, username: "..." } estándar
      else if (responseData.id) {
        userToStore = responseData;
      }
      // Caso C: Estructura anidada { user: { ... } }
      else if (responseData.user) {
        userToStore = {
          ...responseData.user,
          token: responseData.access_token || responseData.token,
          // Mapeamos si es necesario dentro del anidado
          id: responseData.user.id || responseData.user.userId,
        };
      }

      if (!userToStore) {
        console.warn(
          "AuthContext: No se pudo normalizar el usuario. Guardando respuesta cruda."
        );
        userToStore = responseData;
      }

      // Store in localStorage
      window.localStorage.setItem("car-doba-user", JSON.stringify(userToStore));

      // Update state
      setCurrentUser(userToStore);
      console.log("AuthContext: Usuario guardado exitosamente:", userToStore);

      // Navigate to home
      navigate("/");
    } catch (error) {
      console.error("Error en login:", error);

      // Show appropriate error message
      if (error.response && error.response.data && error.response.data.detail) {
        alert(error.response.data.detail);
      } else {
        alert(
          "Error al conectar con el servidor. Verifica que el backend esté corriendo."
        );
      }
    }
  };

  const logout = () => {
    window.localStorage.removeItem("car-doba-user");
    setCurrentUser(null);
    navigate("/login");
  };

  const value = {
    currentUser,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
