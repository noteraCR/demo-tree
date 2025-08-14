// src/views/AdminDashboard/views/ExplorerView.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiMaximize2, FiEye, FiHome, FiUsers } from 'react-icons/fi';
import { useAppStore } from '../../../store/appStore';

// Компонент Sparkline (мини-график)
const Sparkline = ({ data, className }) => {
    if (!data || data.length < 2) return null;
    
    const width = 100;
    const height = 25;
    const maxVal = Math.max(...data);
    const minVal = Math.min(...data);
    const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;

    const points = data
        .map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            const y = height - ((d - minVal) / range) * (height - 4) + 2;
            return `${x},${y}`;
        })
        .join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
            <motion.path
                d={`M ${points}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            />
        </svg>
    );
};

// Компонент узла дерева
const ExplorerNode = ({ agent, level }) => {
    const [isOpen, setIsOpen] = useState(level < 1);
    const hasChildren = agent.children && agent.children.length > 0;
    
    // Получаем действия из store
    const setSelectedAgent = useAppStore(state => state.setSelectedAgent);
    const focusAgent = useAppStore(state => state.focusAgent);

    // ИСПРАВЛЕНИЕ: Убираем rowVariants и анимации для основной строки
    // Оставляем анимации только для раскрытия/скрытия дочерних элементов
    
    return (
        <div className="flex flex-col">
            {/* Основная строка с данными агента */}
            <div className="group flex items-center hover:bg-slate-800/50 rounded-md transition-colors duration-150">
                <div 
                    className="flex items-center flex-grow p-2"
                    style={{ paddingLeft: `${level * 24 + 12}px` }} 
                    onClick={() => hasChildren && setIsOpen(!isOpen)}
                >
                    {/* Иконка-переключатель */}
                    <span className={`mr-2 ${hasChildren ? 'cursor-pointer' : 'opacity-0'}`}>
                        <FiChevronRight className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`} />
                    </span>
                    
                    {/* Аватар и Имя */}
                    <img src={agent.avatar} alt={agent.name} className="w-8 h-8 rounded-full mr-3" />
                    <div className="flex-grow">
                        <p className="font-medium text-slate-200">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.email}</p>
                    </div>
                </div>

                {/* KPI Блоки */}
                <div className="flex items-center shrink-0 pr-4 text-sm">
                    <div className="w-28 text-center">
                        <FiUsers className="inline mr-1" />
                        {agent.directReferrals}
                    </div>
                    <div className="w-28 text-center">{agent.totalInNetwork}</div>
                    <div className="w-40 text-right font-mono text-emerald-400">
                        {agent.earnings.toFixed(2)} €
                    </div>
                    <div className="w-32 px-4">
                        <Sparkline data={agent.earningsHistory} className="text-sky-500" />
                    </div>
                    {/* Кнопки действий */}
                    <div className="flex items-center gap-2 w-24 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={() => focusAgent(agent.id)} 
                            title="Сфокусироваться на этом агенте" 
                            className="p-2 rounded-full hover:bg-slate-700"
                        >
                            <FiMaximize2 />
                        </button>
                        <button 
                            onClick={() => setSelectedAgent(agent)} 
                            title="Открыть инспектор" 
                            className="p-2 rounded-full hover:bg-slate-700"
                        >
                            <FiEye />
                        </button>
                    </div>
                </div>
            </div>

            {/* Рендеринг дочерних узлов */}
            <AnimatePresence initial={false}>
                {isOpen && hasChildren && (
                    <motion.div
                        className="flex flex-col"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                        {agent.children.map(child => (
                            <ExplorerNode 
                                key={child.id} 
                                agent={child} 
                                level={level + 1} 
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// === ГЛАВНЫЙ КОМПОНЕНТ ===
const ExplorerView = () => {
    // Получаем данные и действия из store
    const getExplorerData = useAppStore(state => state.getExplorerData);
    const getBreadcrumbs = useAppStore(state => state.getBreadcrumbs);
    const focusAgent = useAppStore(state => state.focusAgent);
    
    const displayData = getExplorerData();
    const breadcrumbs = getBreadcrumbs();

    // ИСПРАВЛЕНИЕ: Упрощаем анимацию контейнера
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.3,
                // Убираем staggerChildren, так как теперь дочерние элементы не анимируются
            },
        },
    };

    return (
        <div className="flex flex-col h-full">
            {/* Хлебные крошки для навигации */}
            <div className="flex items-center gap-2 p-2 text-sm text-slate-400">
                <button 
                    onClick={() => focusAgent(null)} 
                    className="flex items-center gap-1 hover:text-white"
                >
                    <FiHome /> Корень
                </button>
                {breadcrumbs.map(crumb => (
                    <React.Fragment key={crumb.id}>
                        <FiChevronRight className="text-slate-600" />
                        <button 
                            onClick={() => focusAgent(crumb.id)} 
                            className="hover:text-white"
                        >
                            {crumb.name}
                        </button>
                    </React.Fragment>
                ))}
            </div>

            {/* Заголовок таблицы */}
            <div className="flex items-center p-2 border-y border-slate-800 bg-slate-900/80 sticky top-0 z-10 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                <div className="flex-grow pl-3">Агент</div>
                <div className="flex items-center shrink-0 pr-4">
                    <div className="w-28 text-center">Прямые реф.</div>
                    <div className="w-28 text-center">Всего в сети</div>
                    <div className="w-40 text-right">Доход</div>
                    <div className="w-32 text-center">Динамика</div>
                    <div className="w-24 text-center">Действия</div>
                </div>
            </div>

            {/* Список агентов */}
            <div className="flex-grow overflow-y-auto">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {displayData.map(agent => (
                        <ExplorerNode 
                            key={agent.id} 
                            agent={agent} 
                            level={0} 
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default ExplorerView;