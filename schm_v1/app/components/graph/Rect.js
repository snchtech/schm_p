import React from 'react';
import { Rect } from 'react-konva';

const RectElement = ({ el, onDragEnd, onClickEl, onTransformEnd }) => {
    return (
        <Rect
            key={el.id}
            x={el.x}
            y={el.y}
            width={el.width}
            height={el.height}
            fill={el.fill}
            draggable={true}
            rotation={el.rotation}
            onDragEnd={(e) => {
                console.log("CustomRect DragEnd Event:", e);
                onDragEnd(e);
            }}
            onClick={() => onClickEl(el.id)} // Виправлено onclick → onClick
            onTransformEnd={(e) => onTransformEnd(el.id, e)} // Виправлено index → el.id
        />
    );
};

export default RectElement;