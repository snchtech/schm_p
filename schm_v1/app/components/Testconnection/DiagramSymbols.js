"use client";
import { Group, Rect, Circle } from "react-konva";

export const DiagramSymbols = ({
  symbols,
  isAddingConnector,
  hoveredElement,
  hoveredAnchor,
  getAnchorPoints,
  setHoveredElement,
  setHoveredAnchor,
  handleDragMove,
  handleAnchorClick,
}) => {
  return (
    <>
      {symbols.map((el) => (
        <Group
          key={el.id}
          x={el.x}
          y={el.y}
          draggable
          onDragMove={(e) => handleDragMove(el.id, e)}
          onMouseEnter={() => isAddingConnector && setHoveredElement(el.id)}
          onMouseLeave={() => isAddingConnector && setHoveredElement(null)}
        >
          {el.type === "RECTANGLE" && (
            <Rect width={el.width} height={el.height} fill="gray" stroke="black" strokeWidth={2} />
          )}
          {el.type === "CIRCLE" && (
            <Circle radius={el.width / 2} fill="gray" stroke="black" strokeWidth={2} />
          )}

          {hoveredElement === el.id &&
            getAnchorPoints(el).map((point, i) => (
              <Circle
                key={i}
                x={point.x - el.x}
                y={point.y - el.y}
                radius={6}
                fill={hoveredAnchor && hoveredAnchor.x === point.x && hoveredAnchor.y === point.y ? "yellow" : "green"}
                stroke="black"
                strokeWidth={1}
                onMouseEnter={() => setHoveredAnchor(point)}
                onMouseLeave={() => setHoveredAnchor(null)}
                onClick={() => handleAnchorClick({ ...point, parentId: el.id, kind: "symbolAnchor" })}
              />
            ))}
        </Group>
      ))}
    </>
  );
};