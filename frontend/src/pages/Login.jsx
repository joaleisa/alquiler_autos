import { useState, useEffect } from "react";
import { User, Lock, Eye, EyeOff, Car } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Llamando a login con:", { username, password });
    login(username, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 p-4">
      {}
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-100 p-8 transition-all duration-500 hover:shadow-blue-200/50">
        <div className="flex flex-col items-center mb-8">
          {}
          <div className="p-3 bg-blue-600 rounded-full mb-4 shadow-lg shadow-blue-500/50">
            <Car className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            RentApp
          </h1>
          <p className="text-base text-gray-500 mt-1">
            Inicia sesión en tu cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Nombre de Usuario
            </label>
            <div className="relative">
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl shadow-inner-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-150"
              />
              <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-xl shadow-inner-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-150"
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {}
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-blue-600 text-white text-lg font-bold rounded-xl shadow-md shadow-blue-500/30 hover:bg-blue-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
          >
            Ingresar
          </button>

          {}
          <p className="text-center text-sm">
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
