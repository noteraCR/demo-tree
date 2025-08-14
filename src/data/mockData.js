// src/data/mockData.js
import { generateHugeNetwork } from './networkGenerator';

// --- Генераторы для обогащения данных (остаются без изменений) ---

const generateEarningsHistory = (base) => {
    return Array.from({ length: 12 }, () => base * (0.8 + Math.random() * 0.4));
};

const generateActivityLog = (baseAmount) => {
    return [
        { id: 1, description: "Бонус за нового реферала", amount: baseAmount * 0.1, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { id: 2, description: "Комиссия с продажи", amount: baseAmount * 0.4, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
        { id: 3, description: "Ежемесячный бонус", amount: baseAmount * 0.5, date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    ];
};

// --- Функция-обработчик дерева ---
// ИЗМЕНЕНИЕ: Теперь эта функция вычисляет не только количество агентов в сети, но и их общий доход.
const processTree = (nodes, parentId = null) => {
    return nodes.map(node => {
        // Рекурсивно обрабатываем дочерние узлы, чтобы сначала получить их вычисленные данные.
        const processedChildren = node.children ? processTree(node.children, node.id) : [];
        
        // Считаем общее количество людей в подсети.
        const totalInNetwork = processedChildren.length + processedChildren.reduce((sum, child) => sum + child.totalInNetwork, 0);

        // НОВОЕ: Считаем общий доход сети (сумма доходов всех нижестоящих рефералов).
        const networkEarnings = processedChildren.reduce((sum, child) => {
            // Доход сети = личный доход ребенка + доход его собственной сети.
            return sum + child.earnings + (child.networkEarnings || 0);
        }, 0);

        return {
            ...node,
            parentId,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(node.name)}`,
            directReferrals: processedChildren.length,
            totalInNetwork,
            networkEarnings, // <-- Добавили новое поле с доходом сети.
            earningsHistory: generateEarningsHistory(node.earnings / 10),
            activityLog: generateActivityLog(node.earnings30d),
            children: processedChildren,
        };
    });
};

// --- Главная экспортная функция, использующая генератор ---

export const getFullNetworkData = () => {
    if (!getFullNetworkData.cachedData) {
        const rawTreeData = generateHugeNetwork({
            initialStars: 35,       // Увеличиваем количество лидеров
            maxDepth: 12,           // Глубина до 12 уровней!
            maxChildrenPerNode: 8,  // Больше "кустистость"
            branchingFactor: 0.9,   // Высокий шанс на разрастание
        });
        getFullNetworkData.cachedData = processTree(rawTreeData);
    }
    return getFullNetworkData.cachedData;
};