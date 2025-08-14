// src/views/AdminDashboard/components/InspectorPanel.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDollarSign, FiBarChart2, FiUserCheck, FiUsers } from 'react-icons/fi';
import { useAppStore } from '../../../store/appStore';

// Компонент для отображения KPI карточки
const KPI_Card = ({ title, value, icon: Icon, className = '' }) => (
    <div className={`bg-slate-800/50 p-4 rounded-lg flex flex-col justify-between ${className}`}>
        <div className="flex justify-between items-center text-slate-500">
            <span className="text-sm font-medium">{title}</span>
            <Icon className="w-5 h-5" />
        </div>
        <p className="text-2xl font-bold text-slate-100 mt-2">{value}</p>
    </div>
);

// Кнопка для переключения табов
const TabButton = ({ label, isActive, onClick }) => (
    <button 
        onClick={onClick} 
        className="relative px-3 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
    >
        <span>{label}</span>
        {isActive && (
            <motion.div
                layoutId="inspectorTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
            />
        )}
    </button>
);

// === ГЛАВНЫЙ КОМПОНЕНТ ===
const InspectorPanel = () => {
    const [activeTab, setActiveTab] = useState('activity');
    
    // Получаем данные и действия из store
    const selectedAgent = useAppStore(state => state.selectedAgent);
    const closeInspector = useAppStore(state => state.closeInspector);

    if (!selectedAgent) return null;

    // Анимации
    const panelVariants = {
        hidden: { x: '100%' },
        visible: { x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
        exit: { x: '100%', transition: { duration: 0.2, ease: 'easeInOut' } },
    };

    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
        exit: { opacity: 0 },
    };

    const listStagger = {
        visible: {
            transition: {
                staggerChildren: 0.07,
            },
        },
    };

    const itemFadeIn = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex justify-end"
            aria-labelledby="slide-over-title"
            role="dialog"
            aria-modal="true"
        >
            {/* Фон */}
            <motion.div
                className="absolute inset-0 bg-black/60"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={closeInspector}
            />

            {/* Панель */}
            <motion.div
                className="relative w-full max-w-lg h-full flex flex-col bg-slate-900 border-l border-slate-700/50 shadow-2xl"
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {/* Шапка панели */}
                <header className="flex items-center justify-between p-4 border-b border-slate-800 shrink-0">
                    <div className="flex items-center gap-4">
                        <img 
                            src={selectedAgent.avatar} 
                            alt={selectedAgent.name} 
                            className="w-12 h-12 rounded-full" 
                        />
                        <div>
                            <h2 id="slide-over-title" className="text-lg font-bold text-white">
                                {selectedAgent.name}
                            </h2>
                            <p className="text-sm text-slate-400">{selectedAgent.email}</p>
                        </div>
                    </div>
                    <button 
                        onClick={closeInspector} 
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-800 hover:text-white transition"
                    >
                        <FiX size={20} />
                    </button>
                </header>

                {/* Основной контент */}
                <div className="flex-grow p-6 overflow-y-auto">
                    {/* Блок с KPI */}
                    <motion.div 
                        variants={listStagger} 
                        initial="hidden" 
                        animate="visible" 
                        className="grid grid-cols-2 gap-4 mb-8"
                    >
                        <motion.div variants={itemFadeIn}>
                            <KPI_Card 
                                title="Общий доход" 
                                value={`${selectedAgent.earnings.toFixed(2)} €`} 
                                icon={FiDollarSign} 
                                className="bg-emerald-500/10 text-emerald-400" 
                            />
                        </motion.div>
                        <motion.div variants={itemFadeIn}>
                            <KPI_Card 
                                title="Доход (30 дн.)" 
                                value={`${selectedAgent.earnings30d.toFixed(2)} €`} 
                                icon={FiBarChart2} 
                                className="bg-sky-500/10 text-sky-400" 
                            />
                        </motion.div>
                        <motion.div variants={itemFadeIn}>
                            <KPI_Card 
                                title="Прямые рефералы" 
                                value={selectedAgent.directReferrals} 
                                icon={FiUserCheck} 
                            />
                        </motion.div>
                        <motion.div variants={itemFadeIn}>
                            <KPI_Card 
                                title="Всего в сети" 
                                value={selectedAgent.totalInNetwork} 
                                icon={FiUsers} 
                            />
                        </motion.div>
                    </motion.div>

                    {/* Переключатель табов */}
                    <div className="border-b border-slate-800 mb-4">
                        <nav className="flex -mb-px">
                            <TabButton 
                                label="Активность" 
                                isActive={activeTab === 'activity'} 
                                onClick={() => setActiveTab('activity')} 
                            />
                            <TabButton 
                                label="Рефералы" 
                                isActive={activeTab === 'referrals'} 
                                onClick={() => setActiveTab('referrals')} 
                            />
                            <TabButton 
                                label="Настройки" 
                                isActive={activeTab === 'settings'} 
                                onClick={() => setActiveTab('settings')} 
                            />
                        </nav>
                    </div>

                    {/* Контент табов */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'activity' && (
                                <ul className="space-y-3">
                                    {selectedAgent.activityLog.map(log => (
                                        <li 
                                            key={log.id} 
                                            className="flex items-center justify-between text-sm p-3 bg-slate-800/50 rounded-md"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-300">{log.description}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(log.date).toLocaleString()}
                                                </p>
                                            </div>
                                            <span className="font-mono text-emerald-400">
                                                +{log.amount.toFixed(2)} €
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {activeTab === 'referrals' && (
                                <ul className="space-y-2">
                                    {selectedAgent.children && selectedAgent.children.map(child => (
                                        <li 
                                            key={child.id} 
                                            className="flex items-center p-2 bg-slate-800/50 rounded-md"
                                        >
                                            <img 
                                                src={child.avatar} 
                                                alt={child.name} 
                                                className="w-8 h-8 rounded-full mr-3" 
                                            />
                                            <span className="text-slate-300">{child.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {activeTab === 'settings' && (
                                <div className="space-y-4">
                                    <p className="text-slate-400 text-sm">
                                        Здесь будут опции управления агентом.
                                    </p>
                                    <button className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-md transition">
                                        Изменить статус
                                    </button>
                                    <button className="w-full text-left p-3 bg-red-900/50 hover:bg-red-900/80 text-red-400 rounded-md transition">
                                        Заблокировать агента
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default InspectorPanel;