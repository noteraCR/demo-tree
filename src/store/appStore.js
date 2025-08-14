// src/store/appStore.js
import { create } from 'zustand';
import { getFullNetworkData } from '../data/mockData';

// Вспомогательная функция для поиска узла
const findNodeById = (nodes, nodeId) => {
    for (const node of nodes) {
        if (node.id === nodeId) return node;
        if (node.children) {
            const found = findNodeById(node.children, nodeId);
            if (found) return found;
        }
    }
    return null;
};

// Функция для получения всех потомков узла
const getDescendantIds = (startNode, maxDepth) => {
    const ids = new Set([startNode.id]);
    const queue = startNode.children ? startNode.children.map(child => ({ node: child, depth: 1 })) : [];
    while (queue.length > 0) {
        const { node, depth } = queue.shift();
        if (depth > maxDepth) continue;
        ids.add(node.id);
        if (node.children) {
            for (const child of node.children) {
                queue.push({ node: child, depth: depth + 1 });
            }
        }
    }
    return ids;
};

export const useAppStore = create((set, get) => {
    // Инициализируем данные
    const initialData = getFullNetworkData();
    
    // Автоматически раскрываем первый уровень при инициализации
    const initialExpandedNodes = new Set();
    initialData.forEach(node => {
        if (node.children && node.children.length > 0) {
            initialExpandedNodes.add(node.id);
        }
    });

    return {
        // === ДАННЫЕ ===
        fullData: initialData,
        
        // === СОСТОЯНИЕ UI ===
        mode: 'explorer', // 'galaxy' | 'explorer'
        selectedAgent: null,
        explorerRootId: null,
        searchTerm: '',
        highlightedNodeIds: new Set(),
        expandedNodes: initialExpandedNodes, // Раскрытые узлы в explorer
    
    // === ДЕЙСТВИЯ ===
    
    // Смена режима отображения
    setMode: (mode) => set({ mode }),
    
    // Выбор агента для инспектора
    setSelectedAgent: (agent) => set({ selectedAgent: agent }),
    
    // Закрытие инспектора
    closeInspector: () => set({ selectedAgent: null }),
    
    // Фокус на агенте (переключает в explorer и устанавливает корень)
    focusAgent: (agentId) => {
        const { fullData } = get();
        
        // Определяем новые данные корня
        const rootNode = agentId ? findNodeById(fullData, agentId) : null;
        const newRootData = rootNode ? [rootNode] : fullData;
        
        // Автоматически раскрываем первый уровень
        const expandedNodes = new Set();
        newRootData.forEach(node => {
            if (node.children && node.children.length > 0) {
                expandedNodes.add(node.id);
            }
        });
        
        set({ 
            explorerRootId: agentId, 
            mode: 'explorer',
            expandedNodes: expandedNodes
        });
    },
    
    // Поиск
    setSearchTerm: (searchTerm) => set({ searchTerm }),
    
    // Подсветка узлов в galaxy view
    highlightNodes: (nodeId) => {
        const { fullData } = get();
        const node = findNodeById(fullData, nodeId);
        if (node) {
            const highlightedNodeIds = getDescendantIds(node, 4);
            set({ highlightedNodeIds });
        }
    },
    
    // Очистка подсветки
    clearHighlight: () => set({ highlightedNodeIds: new Set() }),
    
    // Управление раскрытыми узлами
    toggleNodeExpansion: (nodeId) => {
        const { expandedNodes } = get();
        const newExpandedNodes = new Set(expandedNodes);
        if (newExpandedNodes.has(nodeId)) {
            newExpandedNodes.delete(nodeId);
        } else {
            newExpandedNodes.add(nodeId);
        }
        set({ expandedNodes: newExpandedNodes });
    },
    
    // === СЕЛЕКТОРЫ ===
    
    // Получить отфильтрованные данные для explorer
    getExplorerData: () => {
        const { fullData, explorerRootId, searchTerm } = get();
        
        // Определяем корневые данные
        const rootNode = explorerRootId ? findNodeById(fullData, explorerRootId) : null;
        let currentData = rootNode ? [rootNode] : fullData;
        
        // Фильтрация по поиску
        if (!searchTerm.trim()) {
            return currentData;
        }
        
        const lowerCaseTerm = searchTerm.toLowerCase();
        
        const filterTree = (nodes) => {
            return nodes.reduce((acc, node) => {
                const children = node.children ? filterTree(node.children) : [];
                
                if (node.name.toLowerCase().includes(lowerCaseTerm) || 
                    node.email.toLowerCase().includes(lowerCaseTerm) || 
                    children.length > 0) {
                    acc.push({ ...node, children: children });
                }
                return acc;
            }, []);
        };
        
        return filterTree(JSON.parse(JSON.stringify(currentData)));
    },
    
    // Получить хлебные крошки для навигации
    getBreadcrumbs: () => {
        const { fullData, explorerRootId } = get();
        if (!explorerRootId) return [];
        
        const path = [];
        let currentId = explorerRootId;
        
        while (currentId) {
            const node = findNodeById(fullData, currentId);
            if (node) {
                path.unshift({ id: node.id, name: node.name });
                currentId = node.parentId;
            } else {
                break;
            }
        }
        return path;
    }
}});