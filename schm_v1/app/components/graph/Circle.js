import React from "react";
import { Group, Circle } from "react-konva";

const CircleElement = ({ 
    el, 
    onDragEnd, 
    onClickEl, 
    onTransformEnd, 
    onAnchorClick, 
    isAddingConnector, 
    isHovered 
}) => {
    if (!el) {
        console.error("❌ Помилка: `el` не визначено у CircleElement");
        return null;
    }

    const radius = el.radius ?? 50;
    const anchorSize = 6;

    // 🟡 Додаємо точки прив’язки безпосередньо в `el.anchors`
    el.anchors = [
        { id: "top", x: el.x, y: el.y - radius, direction: "top" },
        { id: "bottom", x: el.x, y: el.y + radius, direction: "bottom" },
        { id: "left", x: el.x - radius, y: el.y, direction: "left" },
        { id: "right", x: el.x + radius, y: el.y, direction: "right" }
    ];

    return (
        <Group
            x={el.x}
            y={el.y}
            draggable
            onDragEnd={(e) => {
                console.log("🔥 CircleElement DragEnd Event:", e);
                if (onDragEnd) onDragEnd(e);
            }}
            onClick={() => {
                console.log(`🟢 Клік по колу ID: ${el.id}`);
                if (onClickEl) onClickEl(el.id);
            }}
        >
            {/* 🟡 Головне коло */}
            <Circle radius={radius} fill={el.fill ?? "gray"} stroke="black" strokeWidth={2} />

            {/* 🔵 Точки прив’язки */}
            {(isAddingConnector || isHovered) &&
                el.anchors.map((anchor) => (
                    <Circle
                        key={anchor.id}
                        x={anchor.x - el.x}
                        y={anchor.y - el.y}
                        radius={anchorSize}
                        fill="green"
                        stroke="black"
                        strokeWidth={1}
                        onClick={() => onAnchorClick({ ...anchor, parentId: el.id })}
                    />
                ))
            }
        </Group>
    );
};

export default CircleElement;
