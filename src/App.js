import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Импортируем наши "страницы"
import LoginPage from './pages/LoginPage';
import AdminDashboard from './views/AdminDashboard'; // Наш главный шедевр

// Создадим заглушку для страницы 403
const UnauthorizedPage = () => (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
        <h1 className="text-3xl">403 - Доступ запрещен</h1>
    </div>
);


function App() {
  return (
    // 1. Оборачиваем все в AuthProvider, чтобы у всех компонентов был доступ к данным о пользователе
    <AuthProvider>
      {/* 2. Оборачиваем в BrowserRouter для управления маршрутизацией */}
      <BrowserRouter>
        {/* 3. Routes - контейнер для всех возможных маршрутов */}
        <Routes>
          {/* Публичный маршрут для страницы входа */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Маршрут, доступ к которому запрещен */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          
          {/* Главный, защищенный маршрут админ-панели */}
          <Route 
            path="/admin"
            element={
              // Оборачиваем наш дашборд в "охранника"
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          
          {/* Перенаправление с корневого пути. Если пользователь зайдет на "/", 
              его автоматически перекинет на /admin. "Охранник" внутри /admin решит,
              показать дашборд или перекинуть на /login */}
          <Route path="*" element={<Navigate to="/admin" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;