import { v4 as uuidv4 } from "uuid";
import { calculateOrthogonalPath } from "./pathUtils";

export const addConnection = (connections, setConnections, startAnchor, endAnchor) => {
    if (!startAnchor || !endAnchor) return;

    const newConnection = {
        id: uuidv4(),
        startElementId: startAnchor.parentId,
        endElementId: endAnchor.parentId,
        startPoint: startAnchor,
        endPoint: endAnchor,
        points: calculateOrthogonalPath(startAnchor, endAnchor),
        additionalAnchors: [],
    };

    console.log("✅ Додано новий зв’язок:", newConnection);
    setConnections((prev) => [...prev, newConnection]);
};

export const updateConnections = (elements, connections, setConnections) => {
    setConnections((prev) =>
        prev.map((conn) => {
            const startElement = elements.find((el) => el.id === conn.startElementId);
            const endElement = elements.find((el) => el.id === conn.endElementId);

            if (!startElement || !endElement) {
                console.warn("⚠️ Пропускаємо зв’язок: елементи не знайдені", conn.id);
                return conn;
            }

            const startPoint = { ...conn.startPoint, x: startElement.x, y: startElement.y };
            const endPoint = { ...conn.endPoint, x: endElement.x, y: endElement.y };

            return {
                ...conn,
                points: calculateOrthogonalPath(startPoint, endPoint),
            };
        })
    );
};