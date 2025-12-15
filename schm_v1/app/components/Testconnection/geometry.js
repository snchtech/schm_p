// Геометрія та хелпери (JS)

const EPS = 1e-3;
const eq = (a, b) => Math.abs(a - b) <= EPS;

export const projectPointOnSegment = (px, py, x1, y1, x2, y2) => {
  const dx = x2 - x1,
    dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return { x: x1, y: y1, t: 0, dist2: (px - x1) ** 2 + (py - y1) ** 2 };
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const x = x1 + t * dx,
    y = y1 + t * dy;
  return { x, y, t, dist2: (px - x) ** 2 + (py - y) ** 2 };
};

export const findClosestSegment = (points, px, py) => {
  let best = null;
  const n = points.length / 2;
  for (let i = 0; i < n - 1; i++) {
    const x1 = points[2 * i],
      y1 = points[2 * i + 1];
    const x2 = points[2 * i + 2],
      y2 = points[2 * i + 3];
    const proj = projectPointOnSegment(px, py, x1, y1, x2, y2);
    if (!best || proj.dist2 < best.dist2) best = { segIndex: i, ...proj };
  }
  return best;
};

// твоя поточна функція (залишаю ранню перевірку як є, щоб не міняти поведінку)
export const calculateOrthogonalPath = (
  start,
  end,
  opts = { startOffset: 20, endOffset: 20 },
  startBox = null,
  endBox = null,
  figureWidth = 80,
  figureHeight = 50,
) => {
  const startOffset = Math.max(1, Number(opts?.startOffset ?? 20));
  const endOffset = Math.max(1, Number(opts?.endOffset ?? 20));

  let { x: x1, y: y1, direction: d1 } = start;
  let { x: x2, y: y2, direction: d2 } = end;

  const points = [x1, y1];

  // вихід зі старту
  if (d1 === "left") points.push(x1 - startOffset, y1);
  else if (d1 === "right") points.push(x1 + startOffset, y1);
  else if (d1 === "top") points.push(x1, y1 - startOffset);
  else if (d1 === "bottom") points.push(x1, y1 + startOffset);

  // --- ЛОГІКА ЗЛОМІВ ---

  // --- ЛОГІКА ЗЛОМІВ ---
  // --- ЛОГІКА ЗЛОМІВ ---
  let elbowJustInserted = false;
  {
    const pad = Math.max(8, endOffset);

    if (startBox && endBox) {
      const crossesX = startBox.left <= endBox.right + pad && startBox.right >= endBox.left - pad;
      const above = startBox.bottom + pad < endBox.top;
      const below = startBox.top - pad > endBox.bottom;

      console.log("DEBUG crossesX/above/below", { crossesX, above, below });

      if (crossesX && (above || below)) {
        console.log("⇢ вставляю злом");
        const midY = above ? endBox.top - pad : endBox.bottom + pad;

        const stubX = points[points.length - 2];
        const stubY = points[points.length - 1];

        // додаємо два кроки ламаної
        points.push(stubX, midY);
        points.push(x2, midY);

        elbowJustInserted = true; // <── ВАЖЛИВО
      }
      // якщо умова НЕ виконується → нічого не додаємо,
      // і лінія будується без коліна
    }
  }

  // --- підхід до фінішу ---
  // const lastX2 = points[points.length - 2];
  // const lastY2 = points[points.length - 1];
  // if (d2 === "top") {
  //   if (lastY2 > y2) points.push(lastX2, y2 - endOffset);
  //   else if (lastY2 !== y2) points.push(x2, lastY2);
  // } else if (d2 === "bottom") {
  //   if (lastY2 < y2) points.push(lastX2, y2 + endOffset);
  //   else if (lastY2 !== y2) points.push(x2, lastY2);
  // } else if (d2 === "left") {
  //   if (lastX2 > x2) points.push(x2 - endOffset, lastY2);
  //   else if (lastX2 !== x2) points.push(lastX2, y2);
  // } else if (d2 === "right") {
  //   if (lastX2 < x2) points.push(x2 + endOffset, lastY2);
  //   else if (lastX2 !== x2) points.push(lastX2, y2);
  // }

  // ---- ПІДХІД ДО ФІНІШУ (з урахуванням, що кут уже міг бути вставлений)

  // ---------- ПІДХІД ДО ФІНІШУ ----------
  // --- підхід до фінішу ---
  if (!elbowJustInserted) {
    const lastX2 = points[points.length - 2];
    const lastY2 = points[points.length - 1];

    if (d2 === "top") {
      if (lastY2 > y2) points.push(lastX2, y2 - endOffset);
      else if (lastY2 !== y2) points.push(x2, lastY2);
    } else if (d2 === "bottom") {
      if (lastY2 < y2) points.push(lastX2, y2 + endOffset);
      else if (lastY2 !== y2) points.push(x2, lastY2);
    } else if (d2 === "left") {
      if (lastX2 > x2) points.push(x2 - endOffset, lastY2);
      else if (lastX2 !== x2) points.push(lastX2, y2);
    } else if (d2 === "right") {
      if (lastX2 < x2) points.push(x2 + endOffset, lastY2);
      else if (lastX2 !== x2) points.push(lastX2, y2);
    }
  }

  // --- фінальний stub ---
  if (!elbowJustInserted) {
    const px = points[points.length - 2];
    const py = points[points.length - 1];
    let tx = x2,
      ty = y2;
    if (d2 === "left") {
      tx = x2 - endOffset;
      ty = y2;
    } else if (d2 === "right") {
      tx = x2 + endOffset;
      ty = y2;
    } else if (d2 === "top") {
      tx = x2;
      ty = y2 - endOffset;
    } else if (d2 === "bottom") {
      tx = x2;
      ty = y2 + endOffset;
    }
    if (px !== tx || py !== ty) points.push(tx, ty);
  }

  points.push(x2, y2);

  return points;
  //return routeAvoidingBoxesStrict(points, startBox, endBox, d1, d2, startOffset, endOffset);
};

/*export const calculateOrthogonalPath = (
  start,
  end,
  offsetOrOpts = 20,
  figureWidth = 80,
  figureHeight = 50,
) => {
  const opts =
    typeof offsetOrOpts === "number"
      ? { startOffset: offsetOrOpts, endOffset: offsetOrOpts }
      : offsetOrOpts || {};

  const startOffset = Math.max(1, opts.startOffset ?? 20);
  const endOffset = Math.max(1, opts.endOffset ?? 20);

  let { x: x1, y: y1, direction: d1 } = start;
  let { x: x2, y: y2, direction: d2 } = end;

  // ❗️не блокуємо побудову (щоб не залишалися "хвости")
  const points = [x1, y1];

  // допоміжні відступи (окремо для старту/фінішу)
  const sideStartX = figureWidth / 2 + startOffset;
  const sideStartY = figureHeight / 2 + startOffset;

  // вихід зі старту — тільки зі startOffset
  if (d1 === "left") {
    points.push(x1 - startOffset, y1);
  } else if (d1 === "right") {
    points.push(x1 + startOffset, y1);
  } else if (d1 === "top") {
    points.push(x1, y1 - startOffset);
  } else if (d1 === "bottom") {
    points.push(x1, y1 + startOffset);
  }

  // друге коліно, якщо треба обійти фігуру (використовуємо стартові side-офсети)
  const lastX1 = points[points.length - 2];
  const lastY1 = points[points.length - 1];
  const needSideX = (d1 === "top" && y2 > y1) || (d1 === "bottom" && y2 < y1);
  const needSideY = (d1 === "left" && x2 > x1) || (d1 === "right" && x2 < x1);
  if (d1 === "top" || d1 === "bottom") {
    if (needSideX) points.push(lastX1 + (d1 === "top" ? sideStartX : -sideStartX), lastY1);
  } else if (d1 === "left" || d1 === "right") {
    if (needSideY) points.push(lastX1, lastY1 + (d1 === "left" ? sideStartY : -sideStartY));
  }

  // підхід до фінішу — тут працює вже endOffset
  const lastX2 = points[points.length - 2];
  const lastY2 = points[points.length - 1];

  if (d2 === "top") {
    if (lastY2 > y2) points.push(lastX2, y2 - endOffset);
    else points.push(x2, lastY2);
  } else if (d2 === "bottom") {
    if (lastY2 < y2) points.push(lastX2, y2 + endOffset);
    else points.push(x2, lastY2);
  } else if (d2 === "left") {
    if (lastX2 > x2) points.push(x2 - endOffset, lastY2);
    else points.push(lastX2, y2);
  } else if (d2 === "right") {
    if (lastX2 < x2) points.push(x2 + endOffset, lastY2);
    else points.push(lastX2, y2);
  }

  // відступ перед входом у фініш — теж endOffset
  const px = points[points.length - 2];
  const py = points[points.length - 1];
  if (!(px === x2 && py === y2)) {
    if (d2 === "left") points.push(x2 - endOffset, y2);
    else if (d2 === "right") points.push(x2 + endOffset, y2);
    else if (d2 === "top") points.push(x2, y2 - endOffset);
    else if (d2 === "bottom") points.push(x2, y2 + endOffset);
  }

  points.push(x2, y2);
  return points;
};*/

export const segmentIsHorizontal = (pts, segIndex) => {
  const x1 = pts[2 * segIndex],
    y1 = pts[2 * segIndex + 1];
  const x2 = pts[2 * segIndex + 2],
    y2 = pts[2 * segIndex + 3];
  return Math.abs(y2 - y1) <= Math.abs(x2 - x1);
};

export const getExitDirForLineAttachment = (att, otherPoint, connectionsState) => {
  const parent = connectionsState.find((c) => c.id === att.connectionId);
  if (!parent || att.segIndex == null) return "right";
  const pts = parent.points || [];
  const i = att.segIndex;
  if (2 * i + 3 >= pts.length) return "right";

  const x1 = pts[2 * i],
    y1 = pts[2 * i + 1];
  const x2 = pts[2 * i + 2],
    y2 = pts[2 * i + 3];
  const ax = x1 + att.t * (x2 - x1);
  const ay = y1 + att.t * (y2 - y1);

  const horiz = segmentIsHorizontal(pts, i);
  if (horiz) return otherPoint?.y < ay ? "top" : "bottom";
  return otherPoint?.x < ax ? "left" : "right";
};

export const getExitDir = (att, otherPoint, connectionsState) => {
  if (!att) return "right";
  if (att.type === "symbol") return att.direction;
  if (att.type === "line") return getExitDirForLineAttachment(att, otherPoint, connectionsState);
  return "right";
};

// ⬇️ ДОДАЙ наприкінці файлу (і експортуй)
export const getPolylineElbows = (pts) => {
  if (!pts || pts.length < 6) return { start: null, end: null };

  // перший злам: перший індекс, де змінюється орієнтація
  let start = null;
  for (let i = 0; i < pts.length / 2 - 2; i++) {
    const x1 = pts[2 * i],
      y1 = pts[2 * i + 1];
    const x2 = pts[2 * i + 2],
      y2 = pts[2 * i + 3];
    const x3 = pts[2 * i + 4],
      y3 = pts[2 * i + 5];
    const horiz1 = Math.abs(y2 - y1) <= Math.abs(x2 - x1);
    const horiz2 = Math.abs(y3 - y2) <= Math.abs(x3 - x2);
    if (horiz1 !== horiz2) {
      start = { x: x2, y: y2, idx: i + 1 };
      break;
    }
  }

  // останній злам: шукаємо з кінця
  let end = null;
  for (let i = pts.length / 2 - 3; i >= 0; i--) {
    const x1 = pts[2 * i],
      y1 = pts[2 * i + 1];
    const x2 = pts[2 * i + 2],
      y2 = pts[2 * i + 3];
    const x3 = pts[2 * i + 4],
      y3 = pts[2 * i + 5];
    const horiz1 = Math.abs(y2 - y1) <= Math.abs(x2 - x1);
    const horiz2 = Math.abs(y3 - y2) <= Math.abs(x3 - x2);
    if (horiz1 !== horiz2) {
      end = { x: x2, y: y2, idx: i + 1 };
      break;
    }
  }

  return { start, end };
};

// Повертає кути основної горизонталі (або, якщо горизонталей немає — найдовшого вертикального)
export const getMainRunElbows = (pts) => {
  if (!pts || pts.length < 6) return { start: null, end: null };

  const n = Math.floor(pts.length / 2);

  // 1) шукаємо найдовшу горизонталь
  let bestH = { len: -1, i: -1 };
  for (let i = 0; i < n - 1; i++) {
    const x1 = pts[2 * i],
      y1 = pts[2 * i + 1];
    const x2 = pts[2 * i + 2],
      y2 = pts[2 * i + 3];
    if (y1 === y2) {
      const len = Math.abs(x2 - x1);
      if (len > bestH.len) bestH = { len, i };
    }
  }

  // 2) якщо горизонталі немає — беремо найдовшу вертикаль
  let idx = bestH.i;
  if (idx < 0) {
    let bestV = { len: -1, i: -1 };
    for (let i = 0; i < n - 1; i++) {
      const x1 = pts[2 * i],
        y1 = pts[2 * i + 1];
      const x2 = pts[2 * i + 2],
        y2 = pts[2 * i + 3];
      if (x1 === x2) {
        const len = Math.abs(y2 - y1);
        if (len > bestV.len) bestV = { len, i };
      }
    }
    idx = bestV.i;
    if (idx < 0) return { start: null, end: null };
  }

  // Кути (кінці) цього головного відрізку
  const start = { x: pts[2 * idx], y: pts[2 * idx + 1], idx };
  const end = { x: pts[2 * idx + 2], y: pts[2 * idx + 3], idx: idx + 1 };
  return { start, end };
};

export function mergeCollinear(pts) {
  if (!pts || pts.length < 6) return pts; // менше 3 точок - нічого не робимо
  const res = [pts[0], pts[1]];

  for (let i = 2; i < pts.length; i += 2) {
    const x0 = res[res.length - 4],
      y0 = res[res.length - 3];
    const x1 = res[res.length - 2],
      y1 = res[res.length - 1];
    const x2 = pts[i],
      y2 = pts[i + 1];

    // якщо останні 3 точки на одній прямій (вертикальній або горизонтальній)
    if ((eq(x0, x1) && eq(x1, x2)) || (eq(y0, y1) && eq(y1, y2))) {
      // затираємо середню
      res[res.length - 2] = x2;
      res[res.length - 1] = y2;
    } else {
      res.push(x2, y2);
    }
  }

  return res;
}

// побудова коробки з невеликим запасом pad
export function boxFromSymbol(sym, pad = 6) {
  if (!sym) return null;
  if (sym.type === "RECTANGLE") {
    const { x, y, width, height } = sym;
    return { left: x - pad, right: x + width + pad, top: y - pad, bottom: y + height + pad };
  }
  if (sym.type === "CIRCLE") {
    const r = (sym.width ?? sym.height) / 2;
    return {
      left: sym.x - r - pad,
      right: sym.x + r + pad,
      top: sym.y - r - pad,
      bottom: sym.y + r + pad,
    };
  }
  return null;
}

// перевірка/обхід: якщо сегмент заходить у коробку — зсуваємо його назовні
// export function routeAvoidingBoxes(pts, startBox, endBox) {
//   if (!pts || pts.length < 6) return pts;
//   const boxes = [startBox, endBox].filter(Boolean);
//   const outY = (b, preferAbove) => (preferAbove ? b.top - 8 : b.bottom + 8);
//   const outX = (b, preferLeft) => (preferLeft ? b.left - 8 : b.right + 8);

//   const res = [...pts];
//   const n = res.length / 2;

//   for (const b of boxes) {
//     for (let i = 1; i < n - 2; i++) {
//       // пропускаємо перший і передостанній «stub»
//       const x1 = res[2 * i],
//         y1 = res[2 * i + 1];
//       const x2 = res[2 * i + 2],
//         y2 = res[2 * i + 3];
//       const horiz = Math.abs(y2 - y1) <= Math.abs(x2 - x1);

//       if (horiz) {
//         const y = y1,
//           minX = Math.min(x1, x2),
//           maxX = Math.max(x1, x2);
//         const crossX = !(maxX < b.left || minX > b.right);
//         if (y >= b.top && y <= b.bottom && crossX) {
//           const preferAbove = y < (b.top + b.bottom) / 2;
//           const Y = outY(b, preferAbove);
//           res[2 * i + 1] = Y;
//           res[2 * i + 3] = Y;
//         }
//       } else {
//         const x = x1,
//           minY = Math.min(y1, y2),
//           maxY = Math.max(y1, y2);
//         const crossY = !(maxY < b.top || minY > b.bottom);
//         if (x >= b.left && x <= b.right && crossY) {
//           const preferLeft = x < (b.left + b.right) / 2;
//           const X = outX(b, preferLeft);
//           res[2 * i] = X;
//           res[2 * i + 2] = X;
//         }
//       }
//     }
//   }
//   return mergeCollinear(res);
// }

// Зсуваємо лише внутрішні сегменти, а потім ЖОРСТКО фіксуємо stub-и
export function routeAvoidingBoxesStrict(pts, startBox, endBox, d1, d2, startOffset, endOffset) {
  if (!pts || pts.length < 6) return pts;
  const res = [...pts];
  const n = res.length / 2;
  const boxes = [startBox, endBox].filter(Boolean);

  // 1) Обхід перешкод: чіпаємо ТІЛЬКИ внутрішні сегменти (i = 1..n-3)
  for (const b of boxes) {
    for (let i = 1; i < n - 2; i++) {
      const x1 = res[2 * i],
        y1 = res[2 * i + 1];
      const x2 = res[2 * i + 2],
        y2 = res[2 * i + 3];
      const horiz = Math.abs(y2 - y1) <= Math.abs(x2 - x1);

      if (horiz) {
        const y = y1;
        const minX = Math.min(x1, x2),
          maxX = Math.max(x1, x2);
        const crossesX = !(maxX < b.left || minX > b.right);
        if (y >= b.top && y <= b.bottom && crossesX) {
          const above = y < (b.top + b.bottom) / 2;
          const Y = above ? b.top - 8 : b.bottom + 8;
          res[2 * i + 1] = Y;
          res[2 * i + 3] = Y;
        }
      } else {
        const x = x1;
        const minY = Math.min(y1, y2),
          maxY = Math.max(y1, y2);
        const crossesY = !(maxY < b.top || minY > b.bottom);
        if (x >= b.left && x <= b.right && crossesY) {
          const left = x < (b.left + b.right) / 2;
          const X = left ? b.left - 8 : b.right + 8;
          res[2 * i] = X;
          res[2 * i + 2] = X;
        }
      }
    }
  }

  // 2) ЖОРСТКО фіксуємо стартовий stub: вісь + мінімальний відступ
  if (n >= 2) {
    const sx = res[0],
      sy = res[1];
    // друга точка
    if (d1 === "left" || d1 === "right") {
      // горизонтальний вихід
      res[3] = sy; // ніколи не змінюємо Y у stub
      const sign = d1 === "left" ? -1 : 1;
      const dist = Math.max(startOffset, Math.abs(res[2] - sx));
      res[2] = sx + sign * dist;
    } else {
      // вертикальний вихід
      res[2] = sx; // ніколи не змінюємо X у stub
      const sign = d1 === "top" ? -1 : 1;
      const dist = Math.max(startOffset, Math.abs(res[3] - sy));
      res[3] = sy + sign * dist;
    }
  }

  // 3) ЖОРСТКО фіксуємо кінцевий stub: вісь + мінімальний відступ
  if (n >= 2) {
    const ex = res[2 * n - 2],
      ey = res[2 * n - 1]; // кінцева точка
    // передостанню точку ставимо строго по осі входу
    if (d2 === "left" || d2 === "right") {
      res[2 * n - 3] = ey; // фіксуємо Y
      const dist = Math.max(endOffset, Math.abs(res[2 * n - 4] - ex));
      res[2 * n - 4] = ex + (d2 === "left" ? -dist : dist);
    } else {
      res[2 * n - 4] = ex; // фіксуємо X
      const dist = Math.max(endOffset, Math.abs(res[2 * n - 3] - ey));
      res[2 * n - 3] = ey + (d2 === "top" ? -dist : dist);
    }
  }

  // 3.1 Підтягнути "сусідні" точки, щоб підхід до фігури не проходив крізь бокс
  const pullNeighborAwayFromBox = (arr, box, dir, isStart) => {
    if (!box) return;
    const n = arr.length / 2;
    if (n < 3) return;

    if (isStart) {
      // точка ПІСЛЯ стартового stub'а: p2 = (arr[4], arr[5])
      const xi = 4,
        yi = 5;
      if (dir === "left" && arr[xi] > box.left - 8) arr[xi] = box.left - 8;
      if (dir === "right" && arr[xi] < box.right + 8) arr[xi] = box.right + 8;
      if (dir === "top" && arr[yi] > box.top - 8) arr[yi] = box.top - 8;
      if (dir === "bottom" && arr[yi] < box.bottom + 8) arr[yi] = box.bottom + 8;
    } else {
      // точка ПЕРЕД фінішним stub'ом: p(n-3) = (arr[2*n-6], arr[2*n-5])
      const xi = 2 * n - 6,
        yi = 2 * n - 5;
      if (dir === "left" && arr[xi] > box.left - 8) arr[xi] = box.left - 8;
      if (dir === "right" && arr[xi] < box.right + 8) arr[xi] = box.right + 8;
      if (dir === "top" && arr[yi] > box.top - 8) arr[yi] = box.top - 8;
      if (dir === "bottom" && arr[yi] < box.bottom + 8) arr[yi] = box.bottom + 8;
    }
  };

  // 4) Додаємо додатковий "обхідний" сегмент, якщо stub врізається у коробку
  for (const b of boxes) {
    // передостання точка (stub)
    const n2 = res.length / 2;
    const sx = res[2 * (n2 - 2)];
    const sy = res[2 * (n2 - 2) + 1];
    const ex = res[2 * (n2 - 1)];
    const ey = res[2 * (n2 - 1) + 1];

    // якщо stub всередині коробки по Y (для top/bottom)
    if (sx >= b.left && sx <= b.right && sy >= b.top && sy <= b.bottom) {
      if (d2 === "top" || d2 === "bottom") {
        const sign = d2 === "top" ? -1 : 1;
        const midY = sy + sign * (endOffset + 8);
        res.splice(res.length - 2, 0, sx, midY); // вставляємо перед кінцем
      }
    }

    // якщо stub всередині коробки по X (для left/right)
    if (sy >= b.top && sy <= b.bottom && sx >= b.left && sx <= b.right) {
      if (d2 === "left" || d2 === "right") {
        const sign = d2 === "left" ? -1 : 1;
        const midX = sx + sign * (endOffset + 8);
        res.splice(res.length - 2, 0, midX, sy);
      }
    }
  }

  // підтягуємо точку після стартового stub'а і точку перед фінішним stub'ом
  pullNeighborAwayFromBox(res, startBox, d1, true);
  pullNeighborAwayFromBox(res, endBox, d2, false);

  //return mergeCollinear(res);
  //return orthogonalizeWithStubs(mergeCollinear(res), d1);
  //return mergeCollinear(res);
  //return fixDiagonals(mergeCollinear(res));
  // Замість return fixDiagonals(mergeCollinear(res));
  const merged = mergeCollinear(res);

  // Якщо після merge пропав наш злом (по Y, який ми вставили) – відновлюємо його
  // Наприклад, беремо всі точки res, які були між stubX і x2 з відмінним Y
  if (res.length > merged.length) {
    return fixDiagonals(res); // залишаємо "до-merge"
  }

  return fixDiagonals(merged);
}

// робить ламану строго ортогональною:
// якщо між точками (x1,y1)->(x2,y2) діагональ, вставляємо (x2,y1) або (x1,y2)
// орієнтація першого сегмента береться з d1 (left/right = горизонталь)
export function orthogonalizeWithStubs(pts, d1) {
  if (!pts || pts.length < 4) return pts;

  const out = [pts[0], pts[1]];

  for (let i = 2; i < pts.length; i += 2) {
    const nx = pts[i],
      ny = pts[i + 1];
    const lx = out[out.length - 2],
      ly = out[out.length - 1];

    // уже ортогонально?
    if (eq(lx, nx) || eq(ly, ny)) {
      out.push(nx, ny);
      continue;
    }

    // вибираємо домінуючу вісь (мінімальна зміна форми шляху)
    const dx = Math.abs(nx - lx);
    const dy = Math.abs(ny - ly);

    if (dx >= dy) {
      // спочатку горизонталь, потім вертикаль
      out.push(nx, ly, nx, ny);
    } else {
      // спочатку вертикаль, потім горизонталь
      out.push(lx, ny, nx, ny);
    }
  }

  return mergeCollinear(out);
}

// обхід тільки внутрішніх сегментів (не чіпаємо 0-й і останній stub-и)
function avoidOnInternalSegments(pts, box) {
  if (!box || !pts || pts.length < 6) return pts;
  const res = [...pts];
  const n = res.length / 2;

  for (let i = 1; i < n - 2; i++) {
    const x1 = res[2 * i],
      y1 = res[2 * i + 1];
    const x2 = res[2 * i + 2],
      y2 = res[2 * i + 3];
    const horiz = Math.abs(y2 - y1) <= Math.abs(x2 - x1);

    if (horiz) {
      const y = y1;
      const minX = Math.min(x1, x2),
        maxX = Math.max(x1, x2);
      const crossesX = !(maxX < box.left || minX > box.right);
      if (y >= box.top && y <= box.bottom && crossesX) {
        const above = y < (box.top + box.bottom) / 2;
        const Y = above ? box.top - 8 : box.bottom + 8;
        res[2 * i + 1] = Y;
        res[2 * i + 3] = Y;
      }
    } else {
      const x = x1;
      const minY = Math.min(y1, y2),
        maxY = Math.max(y1, y2);
      const crossesY = !(maxY < box.top || minY > box.bottom);
      if (x >= box.left && x <= box.right && crossesY) {
        const left = x < (box.left + box.right) / 2;
        const X = left ? box.left - 8 : box.right + 8;
        res[2 * i] = X;
        res[2 * i + 2] = X;
      }
    }
  }
  return res;
}

// виправляє діагональні сегменти після обходу коробок
function fixDiagonals(pts) {
  if (!pts || pts.length < 4) return pts;

  const out = [pts[0], pts[1]];

  for (let i = 2; i < pts.length; i += 2) {
    const nx = pts[i],
      ny = pts[i + 1];
    const lx = out[out.length - 2],
      ly = out[out.length - 1];

    if (lx === nx || ly === ny) {
      // вже ортогонально
      out.push(nx, ny);
    } else {
      // вставляємо лікоть
      // вибір: якщо останній сегмент був горизонтальний → спочатку X, інакше Y
      const prevHoriz = out.length >= 4 ? out[out.length - 4] !== out[out.length - 2] : true;

      if (prevHoriz) {
        out.push(nx, ly); // горизонталь
      } else {
        out.push(lx, ny); // вертикаль
      }
      out.push(nx, ny);
    }
  }

  return out;
}

function lineIntersectsBox(x1, y1, x2, y2, box, mode = "any") {
  if (!box) return false;

  const { left, right, top, bottom } = box;

  // Якщо відрізок повністю зліва/справа/вище/нижче — немає перетину
  // якщо просили рахувати тільки горизонтальні
  if (mode === "horiz") {
    if (y1 !== y2) return false; // ігноруємо не-горизонтальні
    return y1 >= top && y1 <= bottom && !(Math.max(x1, x2) < left || Math.min(x1, x2) > right);
  }

  // якщо просили рахувати тільки вертикальні
  if (mode === "vert") {
    if (x1 !== x2) return false; // ігноруємо не-вертикальні
    return x1 >= left && x1 <= right && !(Math.max(y1, y2) < top || Math.min(y1, y2) > bottom);
  }

  // mode === "any" — як було
  if (
    (x1 < left && x2 < left) ||
    (x1 > right && x2 > right) ||
    (y1 < top && y2 < top) ||
    (y1 > bottom && y2 > bottom)
  ) {
    return false;
  }
  if (y1 === y2) {
    return y1 >= top && y1 <= bottom && !(Math.max(x1, x2) < left || Math.min(x1, x2) > right);
  }
  if (x1 === x2) {
    return x1 >= left && x1 <= right && !(Math.max(y1, y2) < top || Math.min(y1, y2) > bottom);
  }
  return false;
}

// повертає true, якщо горизонтальна пряма y=const між xA..xB заходить у box
// якщо ignoreTouchingVerticalSide=true, то «дотик» лише до лівої/правої сторони
// цільового боксу не вважаємо перетином (щоб дозволити прямий вхід у left/right).

function horizontalLineCrossesBox(y, x1, x2, box, ignoreTouch = false) {
  if (!box) return false;

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);

  const crossesX = !(maxX < box.left || minX > box.right);

  if (!crossesX) return false;

  // 🔴 тут змінюємо: раніше перевіряли чи y між top і bottom
  // тепер дозволяємо і коли y вище top, і коли y нижче bottom
  if (y <= box.bottom && y >= box.top) {
    // stubY всередині висоти коробки
    if (ignoreTouch) {
      return !(y === box.top || y === box.bottom);
    }
    return true;
  } else if (y < box.top || y > box.bottom) {
    // stubY вище або нижче, але все одно ламаємо
    return true;
  }

  return false;
}
