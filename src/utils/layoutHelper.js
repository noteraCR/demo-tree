// src/utils/layoutHelper.js
import dagre from 'dagre';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

// ИЗМЕНЕНИЕ: Убираем разделение на типы. Теперь все узлы имеют одинаковый размер.
const nodeDimensions = {
    networkNode: { width: 224, height: 128 } // w-56, высота подобрана под новый контент
};
// Размеры по-умолчанию, если тип узла не определен
const defaultDimensions = nodeDimensions.networkNode;


export const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    // Добавляем опции для лучшего расположения: nodesep - расстояние между узлами на одном уровне, ranksep - расстояние между уровнями
    dagreGraph.setGraph({ rankdir: direction, nodesep: 40, ranksep: 90 });

    nodes.forEach((node) => {
        // Используем корректные размеры для каждого узла
        const dims = nodeDimensions[node.type] || defaultDimensions;
        dagreGraph.setNode(node.id, { width: dims.width, height: dims.height });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        const dims = nodeDimensions[node.type] || defaultDimensions;
        
        node.targetPosition = 'top';
        node.sourcePosition = 'bottom';
        // Координаты от Dagre - это центр узла. Вычисляем позицию верхнего левого угла для React Flow.
        node.position = {
            x: nodeWithPosition.x - dims.width / 2,
            y: nodeWithPosition.y - dims.height / 2,
        };
    });

    return { nodes, edges };
};