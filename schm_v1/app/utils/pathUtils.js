export const calculateOrthogonalPath = (start, end, figureWidth = 80, figureHeight = 50) => {
    let { x: x1, y: y1, direction: d1 } = start;
    let { x: x2, y: y2, direction: d2 } = end;
    let points = [x1, y1];
    const offset = 20; // Базовий відступ

       // 🛑 Перевірка: Забороняємо з'єднання, якщо точки належать одній фігурі
       if (
        Math.abs(x1 - x2) <= figureWidth &&
        Math.abs(y1 - y2) <= figureHeight
    ) {
        return null;
    }

    // Динамічний бічний відступ (тільки якщо є перетин)
    const sideOffsetX = figureWidth / 2 + offset;
    const sideOffsetY = figureHeight / 2 + offset;

    let needsSideOffset = false;
    let needsVerticalOffset = false;

    if ((d1 === "top" && y2 > y1) || (d1 === "bottom" && y2 < y1)) {
        needsSideOffset = true;
    }

    if ((d1 === "left" && x2 > x1) || (d1 === "right" && x2 < x1)) {
        needsVerticalOffset = true;
    }

    // 🟢 Вихід з першої точки
    if (d1 === "left") {
        points.push(x1 - offset, y1);
        if (needsVerticalOffset) points.push(x1 - offset, y1 + sideOffsetY);
    } else if (d1 === "right") {
        points.push(x1 + offset, y1);
        if (needsVerticalOffset) points.push(x1 + offset, y1 - sideOffsetY);
    } else if (d1 === "top") {
        points.push(x1, y1 - offset);
        if (needsSideOffset) points.push(x1 + sideOffsetX, y1 - offset);
    } else if (d1 === "bottom") {
        points.push(x1, y1 + offset);
        if (needsSideOffset) points.push(x1 - sideOffsetX, y1 + offset);
    }

    let lastX = points[points.length - 2];
    let lastY = points[points.length - 1];

    // 🟢 Аналізуємо позицію другої фігури
    if (d2 === "top") {
        if (lastY > y2) {
            points.push(lastX, y2 - offset);
        } else {
            points.push(x2, lastY);
        }
    } else if (d2 === "bottom") {
        if (lastY < y2) {
            points.push(lastX, y2 + offset);
        } else {
            points.push(x2, lastY);
        }
    } else if (d2 === "left") {
        if (lastX > x2) {
            points.push(x2 - offset, lastY);
        } else {
            points.push(lastX, y2);
        }
    } else if (d2 === "right") {
        if (lastX < x2) {
            points.push(x2 + offset, lastY);
        } else {
            points.push(lastX, y2);
        }
    }

    // 🟢 Останній відступ перед кінцевою точкою
    let prevX = points[points.length - 2];
    let prevY = points[points.length - 1];

    if (!(prevX === x2 && prevY === y2)) {
        if (d2 === "left") {
            points.push(x2 - offset, y2);
        } else if (d2 === "right") {
            points.push(x2 + offset, y2);
        } else if (d2 === "top") {
            points.push(x2, y2 - offset);
        } else if (d2 === "bottom") {
            points.push(x2, y2 + offset);
        }
    }

    // 🟢 Фінальне з'єднання
    points.push(x2, y2);

    return points;
};