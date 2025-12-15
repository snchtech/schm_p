import { v4 as uuidv4 } from "uuid";

export const addAnchorPoint = (connections, setConnections, connectionId, event) => {
    const { x, y } = event.target.getStage().getPointerPosition();

    setConnections((prev) =>
        prev.map((conn) =>
            conn.id === connectionId
                ? {
                      ...conn,
                      additionalAnchors: [
                          ...(conn.additionalAnchors || []),
                          { id: uuidv4(), x, y, parentConnectionId: connectionId },
                      ],
                  }
                : conn
        )
    );
};

  // 🟢 Отримання точок прив'язки для елемента
  export const getAnchorPoints = (element) => {
    if (!element || !Array.isArray(element.anchors)) {
        console.warn(`⚠️ Елемент ${element?.id} не має визначених точок прив’язки`);
        return [];
    }
    return element.anchors.map((anchor) => ({
        ...anchor,
        parentId: element.id // Додаємо ID батьківського елемента
    }));
};
