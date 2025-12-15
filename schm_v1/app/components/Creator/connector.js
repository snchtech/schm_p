import { getAnchorPoints } from "../../../app/utils/anchors";
import { calculateOrthogonalPath } from "../../../app/utils/pathUtils"; // Функція для маршруту ліній

export const handleDragMove = (id, e, setElements, getElements, connections, setConnections) => {
    const { x, y } = e.target.position();

    console.log(`🟢 Переміщуємо фігуру ${id} до позиції:`, { x, y });

    // 🟢 Оновлюємо координати елемента
    setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, x, y } : el))
    );

    setTimeout(() => {

    const elements = getElements();

    

    setConnections((prev) =>
        prev.map((conn) => {
            console.log(`🔸 Обробляємо зв’язок ${conn.id}`);
            console.log("🔍 `additionalAnchors` перед оновленням:", JSON.stringify(conn.additionalAnchors, null, 2));

            // 🔹 Шукаємо `startElement` та `endElement`
            let startElement = elements.find((el) => el.id === conn.startElementId);
            let endElement = elements.find((el) => el.id === conn.endElementId);

            // 🔹 Якщо `startElement` не знайдено, шукаємо `startAnchor`
            let startAnchor = conn.additionalAnchors?.find((a) => a.id === conn.startElementId);
            if (!startAnchor) {
                for (let c of prev) {
                    let foundAnchor = c.additionalAnchors?.find((a) => a.id === conn.startElementId);
                    if (foundAnchor) {
                        startAnchor = foundAnchor;
                        break;
                    }
                }
            }

            // 🔹 Якщо `endElement` не знайдено, шукаємо `endAnchor`
            let endAnchor = conn.additionalAnchors?.find((a) => a.id === conn.endElementId);
            if (!endAnchor) {
                for (let c of prev) {
                    let foundAnchor = c.additionalAnchors?.find((a) => a.id === conn.endElementId);
                    if (foundAnchor) {
                        endAnchor = foundAnchor;
                        break;
                    }
                }
            }

            console.log(`  - startElement: ${startElement ? startElement.id : "❌ НЕ знайдено"}`);
            console.log(`  - endElement: ${endElement ? endElement.id : "❌ НЕ знайдено"}`);
            console.log(`  - startAnchor: ${startAnchor ? JSON.stringify(startAnchor) : "❌ НЕ знайдено"}`);
            console.log(`  - endAnchor: ${endAnchor ? JSON.stringify(endAnchor) : "❌ НЕ знайдено"}`);

            // ❌ Якщо `startElement` або `startAnchor` НЕ знайдено – пропускаємо
            if (!startElement && !startAnchor) {
                console.warn(`❌ Пропускаємо: `, conn.id, "– `startElement` або `startAnchor` не існує!");
                return conn;
            }

            // ❌ Якщо `endElement` або `endAnchor` НЕ знайдено – пропускаємо
            if (!endElement && !endAnchor) {
                console.warn(`❌ Пропускаємо: `, conn.id, "– `endElement` або `endAnchor` не існує!");
                return conn;
            }

            // ✅ Використовуємо `startAnchor`, якщо `startElement` не знайдено
            const startPoint = getAnchorPoints(startElement).find((p) => p.direction === conn.startPoint.direction);

            // ✅ Використовуємо `endAnchor`, якщо `endElement` не знайдено
            const endPoint = getAnchorPoints(endElement).find((p) => p.direction === conn.endPoint.direction);

            console.log(`  ✅ Використовуємо startPoint:`, startPoint);
            console.log(`  ✅ Використовуємо endPoint:`, endPoint);

            if (!startPoint || !endPoint) {
                console.warn(`⚠️ Пропускаємо оновлення зв’язку ${conn.id}`);
                return conn;
            }

            // 🟢 Оновлюємо маршрут лінії
            const newPoints = calculateOrthogonalPath(startPoint, endPoint);
            console.log(`  ✅ Оновлені точки маршруту для ${conn.id}:`, newPoints);

            if (!newPoints) {
                console.warn(`⚠️ Шлях не згенерувався для зв’язку ${conn.id}`);
                return conn;
            }

            // 🟢 Оновлюємо точки прив’язки (`additionalAnchors`)
            const updatedAnchors = conn.additionalAnchors?.map((anchor) => {
                if (!anchor) return null;

                // ✅ Якщо `anchor.id` відповідає `endElementId`, прив’язуємо до фігури
                if (anchor.id === conn.endElementId && endElement?.id === id) {
                    console.log(`  🔄 Оновлюємо точку прив’язки: ${anchor.id}, переміщуємо до:`, { x, y });
                    return { ...anchor, x, y };
                }

                return anchor;
            }).filter(a => a !== null);

            console.log(`  ✅ Оновлені точки прив’язки для ${conn.id}:`, updatedAnchors);

            return {
                ...conn,
                points: newPoints,
                additionalAnchors: updatedAnchors, // ✅ Оновлені точки прив’язки
            };
        })
    );
}, 0);
};
