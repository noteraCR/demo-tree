// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import { FiLogIn } from 'react-icons/fi';

const LoginPage = () => {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const from = location.state?.from?.pathname || '/admin'; // Куда перенаправить после входа

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        const success = await login(email, password);
        
        if (success) {
            navigate(from, { replace: true });
        } else {
            setError('Неверный email или пароль.');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md p-8 space-y-8 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-2xl"
            >
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-white">Вход в Панель</h1>
                    <p className="mt-2 text-slate-400">Добро пожаловать. Используйте свои учетные данные.</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Пароль"
                        className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                    />
                     {error && <p className="text-sm text-red-400">{error}</p>}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 px-4 py-3 font-bold text-white bg-sky-600 rounded-lg hover:bg-sky-700 disabled:bg-slate-600 transition-colors"
                    >
                        {isLoading ? 'Проверка...' : <><FiLogIn/> Войти</>}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default LoginPage;