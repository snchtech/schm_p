import React from 'react';
import { Line } from 'react-konva';

const LineElement = ({ el, onDragEnd, onClickEl, onTransformEnd }) => {
    return (
        <Line
            key={el.id}
            x={el.x}
            y={el.y}
            points={el.points}
            stroke="black"
            strokeWidth={2} // Виправлено strokebidth → strokeWidth
            rotation={el.rotation}
            draggable={true}
            onDragEnd={(e) => {
                console.log("CustomRect DragEnd Event:", e);
                onDragEnd(e);
            }}
            onClick={() => onClickEl(el.id)}
            onTransformEnd={(e) => onTransformEnd(el.id, e)} // Виправлено index → el.id
        />
    );
};

export default LineElement;