import React, { createContext, useState, useContext, useMemo } from 'react';

// Создаем контекст
const AuthContext = createContext(null);

// Создаем "Поставщика" (Provider), который будет оборачивать наше приложение
export const AuthProvider = ({ children }) => {
    // Храним данные пользователя. null - пользователь не авторизован.
    const [user, setUser] = useState(null);

    // Функция для симуляции входа в систему.
    // В реальном приложении здесь был бы запрос к API.
    const login = async (email, password) => {
        console.log("Attempting login with:", email, password); // для дебага
        // Симулируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 500));

        // Простая проверка для демо
        if (email === 'admin@example.com' && password === 'password') {
            const userData = {
                name: 'Главный Администратор',
                email: 'admin@example.com',
                role: 'admin',
                avatar: `https://api.dicebear.com/7.x/initials/svg?seed=Admin`,
            };
            setUser(userData);
            return true;
        }
        return false;
    };

    // Функция для выхода
    const logout = () => {
        setUser(null);
    };

    // useMemo используется для того, чтобы объект value не создавался заново при каждом рендере,
    // что предотвращает лишние перерисовки дочерних компонентов.
    const value = useMemo(() => ({
        user,
        login,
        logout,
    }), [user]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Кастомный хук для удобного доступа к контексту в других компонентах
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};