// src/views/AdminDashboard/views/GalaxyView.js
import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

import { getLayoutedElements } from '../../../utils/layoutHelper';
import { useAppStore } from '../../../store/appStore';
import 'reactflow/dist/style.css';

// Трансформация данных в формат React Flow
const transformDataToFlow = (treeData) => {
    const nodes = [];
    const edges = [];
    const traverse = (treeNodes, parentId = null) => {
        treeNodes.forEach((node) => {
            const nodeId = node.id;
            nodes.push({ 
                id: nodeId, 
                type: 'networkNode', 
                position: { x: 0, y: 0 }, 
                data: { ...node } 
            });
            if (parentId) {
                edges.push({ 
                    id: `e-${parentId}-${nodeId}`, 
                    source: parentId, 
                    target: nodeId, 
                    type: 'smoothstep', 
                    animated: false, 
                    style: { stroke: 'rgba(75, 85, 99, 0.7)', strokeWidth: 1.5 } 
                });
            }
            if (node.children && node.children.length > 0) {
                traverse(node.children, nodeId);
            }
        });
    };
    traverse(treeData);
    return { nodes, edges };
};

// Анимации для узлов
const nodeAnimationVariants = {
    normal: { opacity: 1, filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))' },
    highlighted: { opacity: 1, filter: 'drop-shadow(0 0 8px #0ea5e9)' },
    dimmed: { opacity: 0.3, filter: 'drop-shadow(0 0 0px rgba(0,0,0,0))' },
};
const animationTransition = { type: 'tween', duration: 0.2 };

// NetworkNode - ВЫНЕСЕН НАРУЖУ И ИСПОЛЬЗУЕТ ZUSTAND
const NetworkNode = ({ data }) => {
    // Получаем действия из store
    const focusAgent = useAppStore(state => state.focusAgent);
    const setSelectedAgent = useAppStore(state => state.setSelectedAgent);
    const highlightNodes = useAppStore(state => state.highlightNodes);
    const clearHighlight = useAppStore(state => state.clearHighlight);
    
    const containerClasses = `group relative w-56 p-4 bg-slate-800 rounded-xl shadow-lg cursor-pointer border-2 transition-colors
    ${data.isHighlighted ? 'border-sky-400' : 'border-slate-700/50'}`;
    
    let animationState = data.isHighlighted ? 'highlighted' : (data.isDimmed ? 'dimmed' : 'normal');
    
    return (
        <motion.div 
            className={containerClasses} 
            variants={nodeAnimationVariants} 
            initial="normal" 
            animate={animationState} 
            transition={animationTransition} 
            onMouseEnter={() => highlightNodes(data.id)} 
            onMouseLeave={clearHighlight} 
            onClick={() => focusAgent(data.id)}
        >
            <div className="flex items-center gap-3 mb-3">
                <img src={data.avatar} alt={data.name} className="w-12 h-12 rounded-full border-2 border-slate-600" />
                <div className="flex-1 overflow-hidden">
                    <p className="text-base font-bold text-white truncate" title={data.name}>{data.name}</p>
                    <p className="text-xs text-slate-400 truncate" title={data.email}>{data.email}</p>
                </div>
            </div>
            <div className="text-xs text-left font-mono space-y-1.5">
                <p className="text-slate-400">
                    Личный доход: 
                    <span className="font-semibold text-emerald-400 float-right">
                        {data.earnings.toFixed(2)} €
                    </span>
                </p>
                <p className="text-slate-400">
                    Доход сети: 
                    <span className="font-semibold text-sky-300 float-right">
                        {data.networkEarnings.toFixed(2)} €
                    </span>
                </p>
            </div>
            <Handle type="target" position={Position.Top} className="!bg-transparent !border-none" />
            <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-none" />
        </motion.div>
    );
};

// nodeTypes - КОНСТАНТА СНАРУЖИ
const nodeTypes = { networkNode: NetworkNode };

// === ГЛАВНЫЙ КОМПОНЕНТ ===
const GalaxyView = () => {
    // Получаем все что нужно из store
    const fullData = useAppStore(state => state.fullData);
    const searchTerm = useAppStore(state => state.searchTerm);
    const highlightedNodeIds = useAppStore(state => state.highlightedNodeIds);

    // Обработка данных и лейаута
    const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
        const flowData = transformDataToFlow(fullData);
        const isHighlightActive = highlightedNodeIds.size > 0;

        // Устанавливаем флаги подсветки
        flowData.nodes.forEach(node => {
            node.data.isHighlighted = highlightedNodeIds.has(node.id);
            node.data.isDimmed = isHighlightActive && !highlightedNodeIds.has(node.id);
        });

        // Фильтрация по поиску
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const visibleNodeIds = new Set(
                flowData.nodes
                    .filter(node => node.data.name.toLowerCase().includes(lowerCaseSearchTerm))
                    .map(node => node.id)
            );
            flowData.nodes.forEach(node => { 
                node.hidden = !visibleNodeIds.has(node.id); 
            });
        } else {
            flowData.nodes.forEach(node => { 
                node.hidden = false; 
            });
        }
        
        return getLayoutedElements(flowData.nodes, flowData.edges);

    }, [fullData, searchTerm, highlightedNodeIds]);

    return (
        <div className="w-full h-full bg-slate-900 rounded-lg">
            <ReactFlow
                nodes={layoutedNodes}
                edges={layoutedEdges}
                nodeTypes={nodeTypes}
                fitView
                fitViewOptions={{ padding: 0.1, maxZoom: 1.2 }}
                proOptions={{ hideAttribution: true }}
                minZoom={0.05}
                nodesDraggable={false}
                nodesConnectable={false}
            >
                <Background color="#475569" gap={24} variant="dots" />
                <Controls className="!bg-slate-800 !border-slate-700" />
                <MiniMap 
                    nodeColor={node => {
                        if (node.hidden) return 'transparent';
                        if (node.data.isHighlighted) return '#0ea5e9';
                        return '#64748b';
                    }}
                    nodeStrokeWidth={3}
                    className="!bg-slate-800 !border-slate-700"
                />
            </ReactFlow>
        </div>
    );
};

export default GalaxyView;