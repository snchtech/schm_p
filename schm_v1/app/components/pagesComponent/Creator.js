'use client';
import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";
import ToolPanel from "../interface/ToolPanel";
import { v4 as uuidv4 } from "uuid";
import TopNavBar from "../interface/headerLine/TopHeaderLine";
import GraphLibrary from "../../components/graph";
import { handleDragEnd, handleAnchorClick, handleLineClick } from "../Creator/handlers";
import { handleDragMove } from "../Creator/connector";

const pageFormats = {
    A4: { width: 1123, height: 794 },
    A3: { width: 1587, height: 1123 },
    A2: { width: 2245, height: 1587 },
    A1: { width: 3179, height: 2245 },
    A0: { width: 4494, height: 3179 },
};

const Creator = () => {
    const stageRef = useRef(null);
    const [elements, setElements] = useState([]);
    const [connections, setConnections] = useState([]);
    const [selectedFormat, setSelectedFormat] = useState("A4");
    const [canvasSize, setCanvasSize] = useState(pageFormats[selectedFormat]);
    const [selectedAnchor, setSelectedAnchor] = useState(null);
    const [isAddingConnector, setIsAddingConnector] = useState(false);
    const [hoveredElement, setHoveredElement] = useState(null); // 🟢 Додаємо стан наведення


    const getElements = () => {
        console.log("📌 getElements викликано:", elements);
        return [...elements]; // Повертаємо копію, щоб уникнути мутацій
    };

    useEffect(() => {
        setCanvasSize(pageFormats[selectedFormat]);
    }, [selectedFormat]);

    const addElement = (type) => {
        const newElement = {
            id: uuidv4(),
            type,
            x: Math.random() * 300,
            y: Math.random() * 300,
        };
        setElements((prevElements) => [...prevElements, newElement]);
    };

    return (
        <div style={{ display: "flex", paddingTop: "60px" }}>
            <TopNavBar />
            <ToolPanel addElement={addElement} />
            <div style={{ flex: 1, background: "#F0F0F0", position: "relative" }}>
                {/* 🟢 Кнопка для створення зв’язку */}
                <button
                    onClick={() => setIsAddingConnector(true)}
                    style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        padding: "10px 20px",
                        backgroundColor: "green",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        zIndex: 10,
                    }}
                >
                    Створити зв’язок
                </button>

                {/* 🔴 Кнопка для відміни створення зв’язку */}
                {isAddingConnector && (
                    <button
                        onClick={() => {
                            setIsAddingConnector(false);
                            setSelectedAnchor(null);
                        }}
                        style={{
                            position: "absolute",
                            top: 10,
                            left: 140,
                            padding: "10px 20px",
                            backgroundColor: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            zIndex: 10,
                        }}
                    >
                        Відмінити
                    </button>
                )}

                <Stage width={canvasSize.width} height={canvasSize.height} ref={stageRef}>
                    <Layer>
                        {connections.map((conn) => (
                            <Line 
                                key={conn.id} 
                                points={conn.points} 
                                stroke="black" 
                                strokeWidth={2} 
                                onClick={(e) => handleLineClick(conn.id, e, connections, setConnections)} 
                            />
                        ))}

                        {elements.map((el) => {
                            const ElementComponent = GraphLibrary[el.type];
                            return ElementComponent ? (
                                <ElementComponent
                                    key={el.id}
                                    el={el} 
                                    id={el.id}
                                    x={el.x}
                                    y={el.y}
                                    draggable={true}
                                    // onDragEnd={(e) => {
                                    //     console.log("🎯 onDragEnd викликано!", e);
                                    //     handleDragEnd(el.id, e, setElements, elements, connections, setConnections);
                                    // }}
                                    onDragEnd={(e) => {
                                        console.log("🎯 handleDragMove викликано!", el.id);
                                        handleDragMove(el.id, e, setElements, getElements, connections, setConnections);
                                    }}
                                    onAnchorClick={(anchor) => {
                                        if (isAddingConnector) {
                                            handleAnchorClick(anchor, selectedAnchor, setSelectedAnchor, connections, setConnections);
                                        }
                                    }}
                                    onMouseEnter={() => setHoveredElement(el.id)} // 🟢 Фіксуємо ID наведеної фігури
                                    onMouseLeave={() => setHoveredElement(null)} // ❌ Прибираємо при виході
                                    isAddingConnector={isAddingConnector}
                                    isHovered={hoveredElement === el.id} // ✅ Передаємо у компонент, чи наведено
                                />
                            ) : null;
                        })}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
};

export default Creator;
