// src/views/AdminDashboard/index.js
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGrid, FiList, FiSearch, FiCalendar } from 'react-icons/fi';

import GalaxyView from './views/GalaxyView';
import ExplorerView from './views/ExplorerView';
import InspectorPanel from './components/InspectorPanel';
import { useAppStore } from '../../store/appStore';

/**
 * AdminDashboard - Теперь простой как хуй, без всей мемоизации
 */
const AdminDashboard = () => {
    // Достаем все что нужно из store
    const mode = useAppStore(state => state.mode);
    const selectedAgent = useAppStore(state => state.selectedAgent);
    const searchTerm = useAppStore(state => state.searchTerm);
    
    // Действия
    const setMode = useAppStore(state => state.setMode);
    const setSearchTerm = useAppStore(state => state.setSearchTerm);
    const closeInspector = useAppStore(state => state.closeInspector);

    // Анимация переключения видов
    const viewAnimationVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeInOut" } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: "easeInOut" } },
    };

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-slate-300 font-sans antialiased">
            
            {/* === ШАПКА === */}
            <header className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-900/70 backdrop-blur-sm z-10 shrink-0">
                <h1 className="text-xl font-bold text-white">Центр Управления Сетью</h1>
                
                <div className="flex items-center gap-6">
                    {/* Переключатель режимов */}
                    <div className="flex items-center p-1 bg-slate-800 rounded-lg">
                        <ModeButton 
                            icon={FiGrid} 
                            label="Галактика" 
                            isActive={mode === 'galaxy'} 
                            onClick={() => setMode('galaxy')} 
                        />
                        <ModeButton 
                            icon={FiList} 
                            label="Проводник" 
                            isActive={mode === 'explorer'} 
                            onClick={() => setMode('explorer')} 
                        />
                    </div>

                    {/* Поиск */}
                    <div className="relative">
                        <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Поиск по агентам..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-sky-500 focus:outline-none transition"
                        />
                    </div>
                    
                    {/* Выбор даты */}
                    <button className="flex items-center gap-2 text-slate-300 hover:text-white transition">
                        <FiCalendar />
                        <span>Последние 30 дней</span>
                    </button>
                </div>
            </header>

            {/* === ОСНОВНАЯ ОБЛАСТЬ === */}
            <main className="flex-grow relative overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        variants={viewAnimationVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="w-full h-full p-6"
                    >
                        {mode === 'explorer' ? <ExplorerView /> : <GalaxyView />}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* === ИНСПЕКТОР === */}
            <AnimatePresence>
                {selectedAgent && <InspectorPanel />}
            </AnimatePresence>
        </div>
    );
};

// Кнопка переключения режима
const ModeButton = ({ icon: Icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors duration-200 ${
            isActive ? 'text-white' : 'text-slate-400 hover:text-white'
        }`}
    >
        <Icon />
        <span>{label}</span>
        {isActive && (
            <motion.div
                layoutId="activeModeIndicator"
                className="absolute inset-0 bg-sky-600/50 rounded-md -z-10"
                initial={false}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
        )}
    </button>
);

export default AdminDashboard;