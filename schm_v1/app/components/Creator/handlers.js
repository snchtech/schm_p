import { addConnection, updateConnections } from "../../utils/connections";
import { addAnchorPoint } from "../../utils/anchors";

export const handleDragEnd = (id, e, setElements, elements, connections, setConnections) => {
    console.log("🔍 handleDragEnd: Подія ->", e);
    console.log("🔍 e.target:", e?.target);
    
    if (!e || !e.target) {
        console.error("❌ handleDragEnd: Event або target відсутні!", e);
        return;
    }

    if (typeof e.target.x !== "function" || typeof e.target.y !== "function") {
        console.error("❌ handleDragEnd: Невірний event target. Ось його структура:", e.target);
        return;
    }

    const newX = e.target.x();
    const newY = e.target.y();

    console.log(`✅ handleDragEnd: Переміщуємо елемент ${id} до координат (${newX}, ${newY})`);

    setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, x: newX, y: newY } : el))
    );

    updateConnections(elements, connections, setConnections);
};


export const handleAnchorClick = (anchor, selectedAnchor, setSelectedAnchor, connections, setConnections) => {
    if (!selectedAnchor) {
        setSelectedAnchor(anchor);
    } else {
        addConnection(connections, setConnections, selectedAnchor, anchor);
        setSelectedAnchor(null);
    }
};

export const handleLineClick = (connectionId, event, connections, setConnections) => {
    addAnchorPoint(connections, setConnections, connectionId, event);
};