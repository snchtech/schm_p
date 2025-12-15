"use client";
import { Group, Line, Circle, Rect } from "react-konva";

const eq = (a, b, eps = 0.001) => Math.abs(a - b) < eps;
const key1 = (v) => Math.round(v * 10) / 10;

// зібрати всі коліна (місця зміни орієнтації)
function collectElbows(pts) {
  const elbows = [];
  const n = Math.floor(pts.length / 2);
  if (n < 3) return elbows;
  const isHoriz = (i) => {
    const x1 = pts[2 * i],
      y1 = pts[2 * i + 1];
    const x2 = pts[2 * i + 2],
      y2 = pts[2 * i + 3];
    return Math.abs(y2 - y1) <= Math.abs(x2 - x1);
  };
  for (let i = 0; i < n - 2; i++) {
    const h1 = isHoriz(i);
    const h2 = isHoriz(i + 1);
    if (h1 !== h2) {
      const idx = i + 1; // вершина між сегментами i та i+1
      elbows.push({ x: pts[2 * idx], y: pts[2 * idx + 1], idx });
    }
  }
  return elbows;
}

export const DiagramConnections = ({
  connections,
  hoveredConnectionId,
  hoveredLineAnchorId,
  isAddingConnector,
  setHoveredConnectionId,
  setHoveredLineAnchorId,
  handleLineClick,
  handleAnchorClick,
  updateConnectionOffset,
}) => {
  // ---- «переможці» для прямих без зламів ----
  const straightGroups = new Map();
  connections.forEach((c) => {
    const p = c.points || [];
    if (p.length !== 4) return;
    const [x1, y1, x2, y2] = p;
    if (eq(x1, x2)) {
      const key = `V:${key1(x1)}`;
      const arr = straightGroups.get(key) || [];
      arr.push({ id: c.id, topY: Math.min(y1, y2) });
      straightGroups.set(key, arr);
    } else if (eq(y1, y2)) {
      const key = `H:${key1(y1)}`;
      const arr = straightGroups.get(key) || [];
      arr.push({ id: c.id, leftX: Math.min(x1, x2) });
      straightGroups.set(key, arr);
    }
  });
  const straightWinners = new Set();
  for (const [k, arr] of straightGroups.entries()) {
    if (!arr.length) continue;
    if (k.startsWith("V:")) {
      arr.sort((a, b) => a.topY - b.topY); // верхній
      straightWinners.add(arr[0].id);
    } else {
      arr.sort((a, b) => a.leftX - b.leftX); // лівий
      straightWinners.add(arr[0].id);
    }
  }

  return (
    <>
      {connections.map((conn) => {
        const pts = conn.points || [];

        // --- Пряма лінія ---
        if (pts.length === 4) {
          const [x1, y1, x2, y2] = pts;
          const isVert = eq(x1, x2);
          const isHorz = eq(y1, y2);
          if (isVert || isHorz) {
            const show = straightWinners.has(conn.id);
            const hx = isVert ? x1 : Math.min(x1, x2);
            const hy = isVert ? Math.min(y1, y2) : y1;
            return (
              <Group key={conn.id}>
                <Line
                  points={pts}
                  stroke={hoveredConnectionId === conn.id ? "#2F80ED" : "black"}
                  strokeWidth={hoveredConnectionId === conn.id ? 4 : 2}
                  lineJoin="round"
                  lineCap="round"
                  shadowColor={hoveredConnectionId === conn.id ? "#2F80ED" : "transparent"}
                  shadowBlur={hoveredConnectionId === conn.id ? 8 : 0}
                  onMouseEnter={(e) => {
                    setHoveredConnectionId(conn.id);
                    e.target.getStage()?.container().style &&
                      (e.target.getStage().container().style.cursor = "pointer");
                  }}
                  onMouseLeave={(e) => {
                    setHoveredConnectionId(null);
                    e.target.getStage()?.container().style &&
                      (e.target.getStage().container().style.cursor = "default");
                  }}
                  onClick={(e) => {
                    e.cancelBubble = true;
                    handleLineClick(conn.id, e);
                  }}
                />
                {show && (
                  <Rect
                    x={hx - 6}
                    y={hy - 6}
                    width={12}
                    height={12}
                    fill={hoveredConnectionId === conn.id ? "#F2C94C" : "#2D9CDB"}
                    stroke="black"
                    strokeWidth={1}
                  />
                )}
                {/* {console.log("ANCHORS for conn", conn.id, conn.additionalAnchors)} */}
                {(conn.additionalAnchors || []).map((a) => (
                  <Circle
                    key={a.id}
                    x={a.x}
                    y={a.y}
                    radius={6}
                    fill={isAddingConnector && hoveredLineAnchorId === a.id ? "yellow" : "blue"}
                    stroke="black"
                    strokeWidth={1}
                    onMouseEnter={(e) => {
                      if (!isAddingConnector) return;
                      setHoveredLineAnchorId(a.id);
                      e.target.getStage()?.container().style &&
                        (e.target.getStage().container().style.cursor = "pointer");
                    }}
                    onMouseLeave={(e) => {
                      setHoveredLineAnchorId(null);
                      e.target.getStage()?.container().style &&
                        (e.target.getStage().container().style.cursor = "default");
                    }}
                    onClick={() => handleAnchorClick({ ...a, kind: "lineAnchor" })}
                  />
                ))}
              </Group>
            );
          }
        }

        // --- Ламані ---
        if (pts.length < 6) return null;

        const dirFrom = conn.fromExitDir || "right";
        const dirTo = conn.toExitDir || "right";

        // збираємо всі коліна і ПРОПУСКАЄМО перше (stub)
        const elbows = collectElbows(pts);
        const startElbow = elbows.length >= 2 ? elbows[1] : null; // ⬅️ друге коліно
        const endElbow = elbows.length >= 1 ? elbows[elbows.length - 1] : null;

        const sameElbow = startElbow && endElbow && startElbow.idx === endElbow.idx;

        //const showStartHandle = !!startElbow && conn?.from?.type !== "line" && !sameElbow;
        const showStartHandle = !!startElbow && conn?.from?.type !== "line";
        const showEndHandle = !!endElbow && (!sameElbow || (sameElbow && !showStartHandle));
        // const showStartHandle = !!startElbow && conn?.from?.type !== "line";
        // const showEndHandle = !!endElbow;
        return (
          <Group key={conn.id}>
            <Line
              points={pts}
              stroke={hoveredConnectionId === conn.id ? "#2F80ED" : "black"}
              strokeWidth={hoveredConnectionId === conn.id ? 4 : 2}
              lineJoin="round"
              lineCap="round"
              shadowColor={hoveredConnectionId === conn.id ? "#2F80ED" : "transparent"}
              shadowBlur={hoveredConnectionId === conn.id ? 8 : 0}
              onMouseEnter={(e) => {
                setHoveredConnectionId(conn.id);
                e.target.getStage()?.container().style &&
                  (e.target.getStage().container().style.cursor = "pointer");
              }}
              onMouseLeave={(e) => {
                setHoveredConnectionId(null);
                e.target.getStage()?.container().style &&
                  (e.target.getStage().container().style.cursor = "default");
              }}
              onClick={(e) => {
                e.cancelBubble = true;
                handleLineClick(conn.id, e);
              }}
            />

            {showStartHandle && (
              <Rect
                x={startElbow.x - 6}
                y={startElbow.y - 6}
                width={12}
                height={12}
                fill={hoveredConnectionId === conn.id ? "#F2C94C" : "#2D9CDB"}
                stroke="black"
                strokeWidth={1}
                draggable
                dragBoundFunc={(pos) =>
                  dirFrom === "left" || dirFrom === "right"
                    ? { x: pos.x, y: startElbow.y - 6 }
                    : { x: startElbow.x - 6, y: pos.y }
                }
                onDragMove={(e) => {
                  const p = e.target.position();
                  const baseX = pts[0],
                    baseY = pts[1];
                  const raw =
                    dirFrom === "left" || dirFrom === "right"
                      ? Math.abs(p.x + 6 - baseX)
                      : Math.abs(p.y + 6 - baseY);
                  const desiredY = dirFrom === "top" || dirFrom === "bottom" ? p.y + 6 : undefined;
                  const desiredX = dirFrom === "left" || dirFrom === "right" ? p.x + 6 : undefined;
                  updateConnectionOffset(conn.id, raw, "start", { desiredY, desiredX });
                  // const desiredY = dirFrom === "top" || dirFrom === "bottom" ? p.y + 6 : undefined;
                  // updateConnectionOffset(conn.id, raw, "start", { desiredY });
                  //updateConnectionOffset(conn.id, raw, "end", { desiredY });
                }}
              />
            )}

            {showEndHandle && (
              <Rect
                x={endElbow.x - 6}
                y={endElbow.y - 6}
                width={12}
                height={12}
                fill={hoveredConnectionId === conn.id ? "#F2C94C" : "#2D9CDB"}
                stroke="black"
                strokeWidth={1}
                draggable
                dragBoundFunc={(pos) =>
                  dirTo === "left" || dirTo === "right"
                    ? { x: pos.x, y: endElbow.y - 6 }
                    : { x: endElbow.x - 6, y: pos.y }
                }
                onDragMove={(e) => {
                  const p = e.target.position();
                  const baseX = pts[pts.length - 2],
                    baseY = pts[pts.length - 1];
                  const raw =
                    dirTo === "left" || dirTo === "right"
                      ? Math.abs(p.x + 6 - baseX)
                      : Math.abs(p.y + 6 - baseY);
                  // const desiredY = p.y + 6;
                  // updateConnectionOffset(conn.id, raw, "end", { desiredY });
                  const desiredY = dirTo === "top" || dirTo === "bottom" ? p.y + 6 : undefined;
                  const desiredX = dirTo === "left" || dirTo === "right" ? p.x + 6 : undefined;
                  updateConnectionOffset(conn.id, raw, "end", { desiredY, desiredX });
                }}
              />
            )}

            {/* {console.log("ANCHORS for conn", conn.id, conn.additionalAnchors)} */}

            {(conn.additionalAnchors || []).map((a) => (
              <Circle
                key={a.id}
                x={a.x}
                y={a.y}
                radius={6}
                fill={isAddingConnector && hoveredLineAnchorId === a.id ? "yellow" : "blue"}
                stroke="black"
                strokeWidth={1}
                onMouseEnter={(e) => {
                  if (!isAddingConnector) return;
                  setHoveredLineAnchorId(a.id);
                  e.target.getStage()?.container().style &&
                    (e.target.getStage().container().style.cursor = "pointer");
                }}
                onMouseLeave={(e) => {
                  setHoveredLineAnchorId(null);
                  e.target.getStage()?.container().style &&
                    (e.target.getStage().container().style.cursor = "default");
                }}
                onClick={() => handleAnchorClick({ ...a, kind: "lineAnchor" })}
              />
            ))}
          </Group>
        );
      })}
    </>
  );
};
