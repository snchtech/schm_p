"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  projectPointOnSegment,
  findClosestSegment,
  calculateOrthogonalPath,
  segmentIsHorizontal,
  getExitDirForLineAttachment,
  getExitDir,
  getPolylineElbows, // 👈 використовується для «центральної горизонталі» та elbow-фіксів
  boxFromSymbol, // 👈 ДОДАНО: коробка для обходу фігури
} from "./geometry";

export function useDiagramState() {
  const [symbols, setSymbols] = useState([
    { id: uuidv4(), type: "RECTANGLE", x: 100, y: 100, width: 80, height: 50 },
    { id: uuidv4(), type: "CIRCLE", x: 300, y: 200, width: 60, height: 60 },
    { id: uuidv4(), type: "RECTANGLE", x: 450, y: 200, width: 80, height: 50 },
  ]);
  const [connections, setConnections] = useState([]);
  const [isAddingConnector, setIsAddingConnector] = useState(false);
  const [selectedAnchor, setSelectedAnchor] = useState(null);
  const [hoveredAnchor, setHoveredAnchor] = useState(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [message, setMessage] = useState("");
  const [isAddingAnchor, setIsAddingAnchor] = useState(false);
  const [hoveredConnectionId, setHoveredConnectionId] = useState(null);
  const [hoveredLineAnchorId, setHoveredLineAnchorId] = useState(null);

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const MIN_OFFSET = 8;
  const MAX_OFFSET = 300;

  const getAnchorPoints = (element) => {
    const { x, y, width, height, type } = element;
    if (type === "RECTANGLE") {
      return [
        { x: x + width / 2, y: y, direction: "top" },
        { x: x + width / 2, y: y + height, direction: "bottom" },
        { x: x, y: y + height / 2, direction: "left" },
        { x: x + width, y: y + height / 2, direction: "right" },
      ];
    } else if (type === "CIRCLE") {
      return [
        { x: x, y: y - height / 2, direction: "top" },
        { x: x, y: y + height / 2, direction: "bottom" },
        { x: x - width / 2, y: y, direction: "left" },
        { x: x + width / 2, y: y, direction: "right" },
      ];
    }
    return [];
  };

  // режими
  const startAddConnector = () => {
    setIsAddingAnchor(false);
    setSelectedAnchor(null);
    setIsAddingConnector(true);
  };
  const startAddLineAnchor = () => {
    setIsAddingConnector(false);
    setSelectedAnchor(null);
    setIsAddingAnchor(true);
  };

  // нормалізуємо «точку привʼязки»
  const normalizeAttachment = (a) => {
    if (a?.kind === "lineAnchor") {
      return {
        type: "line",
        connectionId: a.parentConnectionId || a.connectionId,
        anchorId: a.id,
        segIndex: a.segIndex,
        t: a.t,
        // 👇 підстраховка — координати беруться напряму
        x: a.x,
        y: a.y,
      };
    }
    return {
      type: "symbol",
      symbolId: a.parentId || a.symbolId || a.id,
      direction: a.direction,
    };
  };

  // актуальна координата привʼязки
  const resolveAttachmentPoint = (att, symbolsState, connectionsState) => {
    if (!att) return null;

    if (att.type === "symbol") {
      const sym = symbolsState.find((s) => s.id === att.symbolId);
      if (!sym) return null;
      return getAnchorPoints(sym).find((p) => p.direction === att.direction) || null;
    }

    if (att.type === "line") {
      const parent = connectionsState.find((c) => c.id === att.connectionId);
      if (!parent) return { x: att.x, y: att.y, direction: "mid" }; // 👈 підстраховка

      const pts = parent.points || [];

      let live = null;
      if (att.anchorId) {
        live = (parent.additionalAnchors || []).find((a) => a.id === att.anchorId) || null;
      }

      if (live) {
        return { x: live.x, y: live.y, direction: "mid" };
      }

      // 👇 fallback напряму з segIndex/t, якщо вони є
      if (att.segIndex != null && att.t != null && 2 * att.segIndex + 3 < pts.length) {
        const x1 = pts[2 * att.segIndex],
          y1 = pts[2 * att.segIndex + 1];
        const x2 = pts[2 * att.segIndex + 2],
          y2 = pts[2 * att.segIndex + 3];
        return { x: x1 + att.t * (x2 - x1), y: y1 + att.t * (y2 - y1), direction: "mid" };
      }

      // останній fallback
      return { x: att.x, y: att.y, direction: "mid" };
    }

    return null;
  };

  // 👇 коробка обходу для прив'язки-символа
  const getBoxForAttachment = (att, symbolsState) => {
    if (!att || att.type !== "symbol") return null;
    const s = symbolsState.find((x) => x.id === att.symbolId);
    return s ? boxFromSymbol(s, 10) : null; // 8 — запас від фігури
  };

  const getBoxes = (from, to, symbolsState) => ({
    startBox: getBoxForAttachment(from, symbolsState),
    endBox: getBoxForAttachment(to, symbolsState),
  });

  // клік по лінії — додаємо «синій» якір
  const handleLineClick = (connectionId, event) => {
    if (!isAddingAnchor) return;
    event.cancelBubble = true;

    const stage = event.target.getStage();
    const { x: px, y: py } = stage.getPointerPosition();

    setConnections((prev) =>
      prev.map((conn) => {
        if (conn.id !== connectionId) return conn;
        const closest = findClosestSegment(conn.points, px, py);

        const already = (conn.additionalAnchors || []).some(
          (a) => Math.abs(a.x - closest.x) < 1 && Math.abs(a.y - closest.y) < 1,
        );
        if (already) {
          console.warn("⚠️ Duplicate anchor prevented on conn", connectionId);
          return conn;
        }

        const newAnchor = {
          id: uuidv4(),
          x: closest.x,
          y: closest.y,
          parentConnectionId: connectionId,
          segIndex: closest.segIndex,
          t: closest.t,
          vertexIndex: null, // завжди null
          kind: "lineAnchor",
        };

        return { ...conn, additionalAnchors: [...(conn.additionalAnchors || []), newAnchor] };
      }),
    );

    setSelectedAnchor(null);
    setIsAddingConnector(false);
    setIsAddingAnchor(false);
  };

  // клік по зеленій/синій точці — створення зʼєднання
  const handleAnchorClick = (anchor) => {
    if (!isAddingConnector) return;

    if (!selectedAnchor) {
      setSelectedAnchor(anchor);
      setMessage("Оберіть наступний елемент для зв'язку");
      return;
    }

    const from = normalizeAttachment(selectedAnchor);
    const to = normalizeAttachment(anchor);

    const startPoint = resolveAttachmentPoint(from, symbols, connections);
    const endPoint = resolveAttachmentPoint(to, symbols, connections);
    if (!startPoint || !endPoint) {
      setSelectedAnchor(null);
      setIsAddingConnector(false);
      setMessage("Не вдалося визначити точки прив'язки");
      return;
    }

    const dirFrom = getExitDir(from, endPoint, connections);
    const dirTo = getExitDir(to, startPoint, connections);

    const initialOffset = 20;
    const path = calculateOrthogonalPath(
      { ...startPoint, direction: dirFrom },
      { ...endPoint, direction: dirTo },
      { startOffset: initialOffset, endOffset: initialOffset },
      getBoxForAttachment(from, symbols),
      getBoxForAttachment(to, symbols),
    );

    const newConnId = uuidv4();

    setConnections((prev) => {
      const next = [...prev];

      // якщо з’єднання йде від/до лінії → знайдемо parent connection
      let inheritedRouting = { startOffset: initialOffset, endOffset: initialOffset };
      if (from.type === "line") {
        const parent = prev.find((c) => c.id === from.connectionId);
        if (parent?.routing) inheritedRouting = { ...parent.routing };
      } else if (to.type === "line") {
        const parent = prev.find((c) => c.id === to.connectionId);
        if (parent?.routing) inheritedRouting = { ...parent.routing };
      }

      const newConn = {
        id: newConnId,
        from,
        to,
        points: path,
        routing: inheritedRouting,
        fromExitDir: dirFrom,
        toExitDir: dirTo,
        additionalAnchors: [], // поки пусто
      };

      // 👇 Ініціалізуємо одразу
      const sp = resolveAttachmentPoint(from, symbols, [...prev, newConn]);
      const ep = resolveAttachmentPoint(to, symbols, [...prev, newConn]);
      if (sp && ep) {
        const df = getExitDir(from, ep, [...prev, newConn]);
        const dt = getExitDir(to, sp, [...prev, newConn]);

        const pts = calculateOrthogonalPath(
          { ...sp, direction: df },
          { ...ep, direction: dt },
          { startOffset: initialOffset, endOffset: initialOffset },
          getBoxForAttachment(from, symbols),
          getBoxForAttachment(to, symbols),
        );
        newConn.points = pts;
        newConn.fromExitDir = df;
        newConn.toExitDir = dt;
      }

      next.push(newConn);
      return next;
    });

    setSelectedAnchor(null);
    setHoveredElement(null);
    setHoveredAnchor(null);
    setMessage("");
    setIsAddingConnector(false);
    setHoveredLineAnchorId(null);

    // Після створення з’єднання — примусове ініціалізування
    setConnections((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;

      const next = [...prev];
      const idx = next.length - 1;

      const sp = resolveAttachmentPoint(last.from, symbols, next);
      const ep = resolveAttachmentPoint(last.to, symbols, next);

      if (sp && ep) {
        const dirFrom = getExitDir(last.from, ep, next);
        const dirTo = getExitDir(last.to, sp, next);
        const pts = calculateOrthogonalPath(
          { ...sp, direction: dirFrom },
          { ...ep, direction: dirTo },
          { startOffset: last.routing.startOffset, endOffset: last.routing.endOffset },
          getBoxForAttachment(last.from, symbols),
          getBoxForAttachment(last.to, symbols),
        );

        next[idx] = {
          ...last,
          points: pts,
          fromExitDir: dirFrom,
          toExitDir: dirTo,
          routing: last.routing,
        };
      }

      return next;
    });
  };

  // перетягування фігури
  const handleDragMove = (id, e) => {
    const { x, y } = e.target.position();
    const symbolsNext = symbols.map((s) => (s.id === id ? { ...s, x, y } : s));
    setSymbols(symbolsNext);

    setConnections((prev) => {
      // 1) тільки для symbol↔symbol, які прив’язані до цієї фігури
      let next = prev.map((conn) => {
        if (conn.from?.type !== "symbol" || conn.to?.type !== "symbol") {
          return conn; // тут не символи
        }
        if (conn.from.symbolId !== id && conn.to.symbolId !== id) {
          return conn; // ця лінія не чіпає поточну фігуру
        }

        const sp = resolveAttachmentPoint(conn.from, symbolsNext, prev);
        const ep = resolveAttachmentPoint(conn.to, symbolsNext, prev);
        if (!sp || !ep) return conn;

        const dirFrom = getExitDir(conn.from, ep, prev);
        const dirTo = getExitDir(conn.to, sp, prev);

        let routing = {
          startOffset: conn.routing?.startOffset ?? 20,
          endOffset: conn.routing?.endOffset ?? 20,
        };

        if (conn.from?.type === "line") {
          const parent = next.find((c) => c.id === conn.from.connectionId);
          if (parent?.routing) routing = { ...parent.routing };
        }
        if (conn.to?.type === "line") {
          const parent = next.find((c) => c.id === conn.to.connectionId);
          if (parent?.routing) routing = { ...parent.routing };
        }

        const pts = calculateOrthogonalPath(
          { ...sp, direction: dirFrom },
          { ...ep, direction: dirTo },
          routing,
          getBoxForAttachment(conn.from, symbolsNext),
          getBoxForAttachment(conn.to, symbolsNext),
        );

        return pts
          ? { ...conn, points: pts, fromExitDir: dirFrom, toExitDir: dirTo, routing }
          : { ...conn, routing: conn.routing };
      });

      // 2) для тих, що підключені до ліній
      next = next.map((conn) => {
        if (conn.from?.type === "line" || conn.to?.type === "line") {
          const sp = resolveAttachmentPoint(conn.from, symbolsNext, next);
          const ep = resolveAttachmentPoint(conn.to, symbolsNext, next);
          if (!sp || !ep) return { ...conn, routing: conn.routing };

          const dirFrom = getExitDir(conn.from, ep, next);
          const dirTo = getExitDir(conn.to, sp, next);

          // наслідуємо routing від parent
          // let routing = conn.routing ?? { startOffset: 20, endOffset: 20 };
          // if (conn.from?.type === "line") {
          //   const parent = next.find((c) => c.id === conn.from.connectionId);
          //   if (parent?.routing) {
          //     routing = { ...parent.routing };
          //   }
          // }
          // if (conn.to?.type === "line") {
          //   const parent = next.find((c) => c.id === conn.to.connectionId);
          //   if (parent?.routing) {
          //     routing = { ...parent.routing };
          //   }
          // }

          // беремо власний routing, якщо він вже є
          let routing = {
            startOffset: conn.routing?.startOffset ?? 20,
            endOffset: conn.routing?.endOffset ?? 20,
          };

          // якщо у зв'язку ще нема routing (новий) — тільки тоді наслідуємо від parent
          if (!conn.routing) {
            if (conn.from?.type === "line") {
              const parent = next.find((c) => c.id === conn.from.connectionId);
              if (parent?.routing) routing = { ...parent.routing };
            }
            if (conn.to?.type === "line") {
              const parent = next.find((c) => c.id === conn.to.connectionId);
              if (parent?.routing) routing = { ...parent.routing };
            }
          }

          const pts = calculateOrthogonalPath(
            { ...sp, direction: dirFrom },
            { ...ep, direction: dirTo },
            routing,
            getBoxForAttachment(conn.from, symbolsNext),
            getBoxForAttachment(conn.to, symbolsNext),
          );

          return pts
            ? { ...conn, points: pts, fromExitDir: dirFrom, toExitDir: dirTo, routing }
            : { ...conn, routing };
        }
        return { ...conn, routing: conn.routing };
      });

      // 3) оновлюємо позиції синіх анкорів
      next = next.map((conn) => {
        if (!conn.additionalAnchors?.length) return conn;
        const updatedAnchors = conn.additionalAnchors.map((a) => {
          const i = a.segIndex;
          const pts = conn.points || [];
          if (i == null || 2 * i + 3 >= pts.length) return a;
          const x1 = pts[2 * i],
            y1 = pts[2 * i + 1];
          const x2 = pts[2 * i + 2],
            y2 = pts[2 * i + 3];
          return { ...a, x: x1 + a.t * (x2 - x1), y: y1 + a.t * (y2 - y1) };
        });
        return { ...conn, additionalAnchors: updatedAnchors, routing: conn.routing };
      });

      return next;
    });
  };

  // 🔁 оновити segIndex/t у ВСІХ дочірніх прив'язках на оновлений parent
  const propagateAnchorIndexToChildren = (next, parentId, updatedAnchors) => {
    const fixAtt = (att) => {
      if (att?.type === "line" && att.connectionId === parentId && att.anchorId) {
        const live = (updatedAnchors || []).find((a) => a.id === att.anchorId);
        if (live) {
          return { ...att, segIndex: live.segIndex, t: live.t }; // критично
        }
      }
      return att;
    };

    return next.map((c) => {
      const newFrom = fixAtt(c.from);
      const newTo = fixAtt(c.to);
      if (newFrom !== c.from || newTo !== c.to) {
        return { ...c, from: newFrom, to: newTo };
      }
      return c;
    });
  };

  // зміна «офсету» (хендлами) + коректне оновлення дітей
  const updateConnectionOffset = (connId, newOffset, side = "both", extra = {}) => {
    setConnections((prev) => {
      const pad = clamp(newOffset, MIN_OFFSET, MAX_OFFSET);

      const current = prev.find((c) => c.id === connId);
      const oldPts = current?.points || [];

      let next = [...prev];
      const idx = next.findIndex((c) => c.id === connId);
      if (idx < 0) return prev;
      let conn = next[idx];

      let prevStart = conn.routing?.startOffset ?? 20;
      let prevEnd = conn.routing?.endOffset ?? 20;

      let newStart = prevStart;
      let newEnd = prevEnd;

      if (side === "start") {
        newStart = pad;
        if (typeof extra?.desiredY === "number" || typeof extra?.desiredX === "number") {
          newEnd = pad;
        }
      } else if (side === "end") {
        newEnd = pad;
        if (typeof extra?.desiredY === "number" || typeof extra?.desiredX === "number") {
          newStart = pad;
        }
      } else if (side === "both") {
        newStart = pad;
        newEnd = pad;
      }

      conn = {
        ...conn,
        routing: {
          startOffset: side === "end" ? prevStart : newStart,
          endOffset: side === "start" ? prevEnd : newEnd,
        },
      };

      next[idx] = conn;

      // 2) ковзання синього якірця по батьківській вертикалі/горизонталі
      if (
        side === "end" &&
        conn.from?.type === "line" &&
        (typeof extra?.desiredY === "number" || typeof extra?.desiredX === "number")
      ) {
        const parentIdx = next.findIndex((c) => c.id === conn.from.connectionId);
        if (parentIdx >= 0) {
          const parent = next[parentIdx];
          const ppts = parent.points || [];
          const si = conn.from.segIndex;
          if (Number.isFinite(si) && 2 * si + 3 < ppts.length) {
            const x1 = ppts[2 * si],
              y1 = ppts[2 * si + 1];
            const x2 = ppts[2 * si + 2],
              y2 = ppts[2 * si + 3];

            // вертикальний сегмент
            if (x1 === x2 && typeof extra.desiredY === "number") {
              const ymin = Math.min(y1, y2),
                ymax = Math.max(y1, y2);
              const y = Math.max(ymin, Math.min(ymax, extra.desiredY));
              const t = y2 === y1 ? 0 : (y - y1) / (y2 - y1);
              const updAnch = (parent.additionalAnchors || []).map((a) =>
                a.id === conn.from.anchorId
                  ? { ...a, x: x1, y, segIndex: si, t, vertexIndex: null }
                  : a,
              );
              next[parentIdx] = { ...parent, additionalAnchors: updAnch };
              conn = { ...conn, from: { ...conn.from, segIndex: si, t } };
              next[idx] = conn;
            }

            // горизонтальний сегмент
            if (y1 === y2 && typeof extra.desiredX === "number") {
              const xmin = Math.min(x1, x2),
                xmax = Math.max(x1, x2);
              const x = Math.max(xmin, Math.min(xmax, extra.desiredX));
              const t = x2 === x1 ? 0 : (x - x1) / (x2 - x1);
              const updAnch = (parent.additionalAnchors || []).map((a) =>
                a.id === conn.from.anchorId
                  ? { ...a, x, y: y1, segIndex: si, t, vertexIndex: null }
                  : a,
              );
              next[parentIdx] = { ...parent, additionalAnchors: updAnch };
              conn = { ...conn, from: { ...conn.from, segIndex: si, t } };
              next[idx] = conn;
            }
          }
        }
      }

      // 3) перерахунок маршруту з урахуванням офсетів та коробок обходу
      const sp = resolveAttachmentPoint(conn.from, symbols, next);
      const ep = resolveAttachmentPoint(conn.to, symbols, next);
      if (sp && ep) {
        const dirFrom = getExitDir(conn.from, ep, next);
        const dirTo = getExitDir(conn.to, sp, next);
        let pts = calculateOrthogonalPath(
          { ...sp, direction: dirFrom },
          { ...ep, direction: dirTo },
          { startOffset: conn.routing.startOffset, endOffset: conn.routing.endOffset },
          getBoxForAttachment(conn.from, symbols),
          getBoxForAttachment(conn.to, symbols),
        );

        const updatedAnchors = (conn.additionalAnchors || []).map((a) => {
          if (a.vertexIndex != null) {
            const vi = a.vertexIndex;
            const vx = pts[2 * vi],
              vy = pts[2 * vi + 1];
            const maxSeg = pts.length / 2 - 2;
            let newSeg = Math.min(Math.max(vi - 1, 0), maxSeg);
            let newT = 0.5;
            return { ...a, x: vx, y: vy, segIndex: newSeg, t: newT, vertexIndex: null };
          }
          let nearest = findClosestSegment(pts, a.x, a.y);
          return { ...a, x: nearest.x, y: nearest.y, segIndex: nearest.segIndex, t: nearest.t };
        });

        next[idx] = {
          ...conn,
          points: pts,
          fromExitDir: dirFrom,
          toExitDir: dirTo,
          additionalAnchors: updatedAnchors,
          routing: conn.routing,
        };

        next = propagateAnchorIndexToChildren(next, connId, updatedAnchors);
      }

      // 4) перерахунок залежних звʼязків (ті, що причеплені до цієї лінії)
      next = next.map((c) => {
        const dependsOn = (att) => att?.type === "line" && att.connectionId === connId;
        if (!dependsOn(c.from) && !dependsOn(c.to)) return { ...c, routing: c.routing };
        const sp2 = resolveAttachmentPoint(c.from, symbols, next);
        const ep2 = resolveAttachmentPoint(c.to, symbols, next);
        if (!sp2 || !ep2) return c;
        const df = getExitDir(c.from, ep2, next);
        const dt = getExitDir(c.to, sp2, next);
        const pts2 = calculateOrthogonalPath(
          { ...sp2, direction: df },
          { ...ep2, direction: dt },
          { startOffset: c.routing?.startOffset ?? 20, endOffset: c.routing?.endOffset ?? 20 },
          getBoxForAttachment(c.from, symbols),
          getBoxForAttachment(c.to, symbols),
        );
        return { ...c, points: pts2, fromExitDir: df, toExitDir: dt, routing: c.routing };
      });

      // 5) синхронізуємо координати «синіх» якорів на їхніх маршрутах
      next = next.map((c) => {
        if (!c.additionalAnchors?.length) return { ...c, routing: c.routing };
        const upd = c.additionalAnchors.map((a) => {
          const i = a.segIndex;
          const pts = c.points || [];
          if (i == null || 2 * i + 3 >= pts.length) return a;
          const x1 = pts[2 * i],
            y1 = pts[2 * i + 1];
          const x2 = pts[2 * i + 2],
            y2 = pts[2 * i + 3];
          return { ...a, x: x1 + a.t * (x2 - x1), y: y1 + a.t * (y2 - y1) };
        });
        return { ...c, additionalAnchors: upd, routing: c.routing };
      });

      return next;
    });
  };

  return {
    symbols,
    connections,
    isAddingConnector,
    selectedAnchor,
    hoveredAnchor,
    hoveredElement,
    message,
    isAddingAnchor,
    hoveredConnectionId,
    hoveredLineAnchorId,

    setIsAddingConnector,
    setIsAddingAnchor,
    setHoveredElement,
    setHoveredAnchor,
    setHoveredConnectionId,
    setHoveredLineAnchorId,

    getAnchorPoints,
    handleLineClick,
    handleAnchorClick,
    handleDragMove,
    updateConnectionOffset,
    startAddConnector,
    startAddLineAnchor,
  };
}
