"use client";
import { Stage, Layer } from "react-konva";
import { useDiagramState } from "./useDiagramState";
import { DiagramConnections } from "./DiagramConnections";
import { DiagramSymbols } from "./DiagramSymbols";

export default function DiagramEditor() {
  const S = useDiagramState();

  return (
    <div style={{ gap: 8 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <button onClick={S.startAddConnector}>Новий connector</button>
        {S.isAddingConnector && (
          <button onClick={() => S.setIsAddingConnector(false)}>Відмінити</button>
        )}
        <button onClick={S.startAddLineAnchor}>Нова точка прив'язки на лінії</button>
        {S.isAddingAnchor && (
          <button onClick={() => S.setIsAddingAnchor(false)}>Відмінити</button>
        )}
      </div>

      <p>{S.message}</p>

      <Stage width={1000} height={600} style={{ border: "1px solid #ccc" }}>
        <Layer>
          <DiagramConnections
            connections={S.connections}
            hoveredConnectionId={S.hoveredConnectionId}
            hoveredLineAnchorId={S.hoveredLineAnchorId}
            isAddingConnector={S.isAddingConnector}
            setHoveredConnectionId={S.setHoveredConnectionId}
            setHoveredLineAnchorId={S.setHoveredLineAnchorId}
            handleLineClick={S.handleLineClick}
            handleAnchorClick={S.handleAnchorClick}
            updateConnectionOffset={S.updateConnectionOffset}
          />
          <DiagramSymbols
            symbols={S.symbols}
            isAddingConnector={S.isAddingConnector}
            hoveredElement={S.hoveredElement}
            hoveredAnchor={S.hoveredAnchor}
            getAnchorPoints={S.getAnchorPoints}
            setHoveredElement={S.setHoveredElement}
            setHoveredAnchor={S.setHoveredAnchor}
            handleDragMove={S.handleDragMove}
            handleAnchorClick={S.handleAnchorClick}
          />
        </Layer>
      </Stage>
    </div>
  );
}