import React from 'react';
import { Text } from 'react-konva';

const TextElement = ({ el, onDragEnd, onClickEl, onTransformEnd }) => {
    return (
        <Text
            key={el.id}
            x={el.x}
            y={el.y}
            text={el.text}
            fontSize={20}
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

export default TextElement;