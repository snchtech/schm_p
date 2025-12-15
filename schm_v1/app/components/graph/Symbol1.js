import { useState } from "react";
import { Group, Line, Circle, Rect } from "react-konva";
import { v4 as uuidv4 } from "uuid";

const Symbol1 = ({ 
  x, 
  y, 
  id, 
  onDragEnd, 
  onAnchorClick, 
  isAddingConnector, 
  isHovered, 
  isSelectable = true 
}) => {
  const [isSelected, setIsSelected] = useState(false);

  const handleClick = () => {
    if (isSelectable) {
      setIsSelected(!isSelected);
    }
  };

  // 📌 Розміри
  const selectionStrokeWidth = 1; // Ширина виділення
  const anchorSize = 8; // Розмір точок прив'язки
  const halfAnchor = anchorSize / 2; // Половина розміру точки прив’язки
  const halfStroke = selectionStrokeWidth / 2; // Половина ширини лінії виділення

  // 📌 Центрування точок прив’язки
  const anchors = [
    { id: uuidv4(), x: 50, y: 0, direction: "top" },
    { id: uuidv4(), x: 50, y: 100, direction: "bottom" },
    { id: uuidv4(), x: 0, y: 50, direction: "left" },
    { id: uuidv4(), x: 100, y: 50, direction: "right" }
  ];

  return (
    <Group
      x={x}
      y={y}
      draggable
      onDragEnd={(e) => {
        console.log("🔥 Symbol1 DragEnd Event:", e);
        if (onDragEnd) {
          onDragEnd(e); // ✅ Передаємо id елемента
        }
      }}
      onClick={handleClick}
    >
      {/* 🟦 Виділення (якщо елемент вибраний) */}
      {isSelected && (
        <Rect
          x={-halfStroke}
          y={-halfStroke}
          width={100 + selectionStrokeWidth}
          height={100 + selectionStrokeWidth}
          stroke="blue"
          strokeWidth={selectionStrokeWidth}
          dash={[4, 4]}
        />
      )}

      {/* 🔗 Точки прив’язки - з'являються при наведенні або у режимі створення зв'язку */}
      {(isAddingConnector || isHovered) &&
        anchors.map((point) => (
          <Circle
            key={point.id}
            x={point.x}
            y={point.y}
            radius={6}
            fill="green"
            stroke="black"
            strokeWidth={1}
            onClick={() => onAnchorClick({ 
              ...point, 
              x: point.x + x,  // Додаємо глобальні координати
              y: point.y + y, 
              parentId: id 
          })}
          />
        ))}

      {/* 📌 Основна графіка елемента */}
      <Line points={[50.5, 13, 50.5, 64]} stroke="black" strokeWidth={3} />
      <Circle x={50.5} y={40.5} radius={5.5} fill="black" />
      <Line points={[6.5, 46, 6.5, 85]} stroke="black" strokeWidth={3} />
      <Line points={[51.5, 62.5, 6.5, 83.5]} stroke="black" strokeWidth={3} />
      <Line points={[5.5, 46.5, 50, 62]} stroke="black" strokeWidth={3} />
      <Line points={[93.2, 81.1, 92.5, 42.1]} stroke="black" strokeWidth={3} />
      <Line points={[47.9, 64.9, 92.5, 43.1]} stroke="black" strokeWidth={3} />
      <Line points={[94.2, 80.1, 47.5, 64.5]} stroke="black" strokeWidth={3} />
    </Group>
  );
};

export default Symbol1;
