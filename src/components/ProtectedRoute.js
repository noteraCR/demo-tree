import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * Обертка для маршрутов, требующих аутентификации.
 * @param {{children: React.ReactNode, role?: string}} props
 */
const ProtectedRoute = ({ children, role = 'admin' }) => {
    const { user } = useAuth();
    const location = useLocation();

    // 1. Проверяем, есть ли пользователь в системе
    if (!user) {
        // Перенаправляем на страницу входа, запоминая, куда пользователь хотел попасть
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 2. (Опционально) Проверяем, есть ли у пользователя нужная роль
    if (user.role !== role) {
        // Можно перенаправить на страницу "Доступ запрещен" (403)
        return <Navigate to="/unauthorized" replace />;
    }

    // 3. Если все проверки пройдены - показываем запрошенный компонент
    return children;
};

export default ProtectedRoute;