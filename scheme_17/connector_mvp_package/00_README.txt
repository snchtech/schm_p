CONNECTOR MVP 2.0 TEST PACKAGE
==============================

Що це:
- готовий комплект txt-файлів для тестування нової архітектури конекторів;
- основа: route.vertices + route.pathHandles + geometry.segmentsMeta + stable segmentId;
- підтримка: draft connector flow, orthogonal-elbow, free-straight, orthogonal-straight, arrow endcaps.

Що входить:
1. getConnectorPathType.txt
2. connectorModel.txt
3. connectorMarkers.txt
4. connectorGeometry.txt
5. connectorEditing.txt
6. useCanvasStore.txt
7. canvasController.txt
8. ConnectorsLayer.txt
9. CanvasContextMenu.txt
10. DraftConnectorLayer.txt
11. ConnectorsToolSection.txt
12. EditorCanvas_stage_hooks.txt

Порядок підключення:
1. Створити helper getConnectorPathType.
2. Замінити connector model на pathType-based model.
3. Підключити geometry builder з buildOrthogonalElbowGeometry().
4. Підключити connectorEditing.
5. Підключити store стани для tool/draft/context menu.
6. Підключити canvasController.
7. Замінити ConnectorsLayer.
8. Підключити CanvasContextMenu та DraftConnectorLayer.
9. Додати stage hooks з EditorCanvas_stage_hooks.txt.
10. Підключити панель ConnectorsToolSection.

Важливо:
- imports у txt-файлах можуть потребувати дрібного коригування під твою структуру каталогів;
- де є resolveConnectorStartPoint / resolveConnectorEndPoint / getConnectorAttachPreview, припускається, що ці helper-и вже існують у твоєму проєкті;
- у старому коді бажано прибрати baseOffset і старі waypoints як основну модель;
- connectorType бажано не використовувати, але helper дає сумісність на перехідний період.

Що тестувати після вставки:
- побудова draft-конектора від anchor до anchor;
- побудова від anchor у вільну точку canvas;
- drag whole connector тільки коли обидва кінці detached;
- orthogonal-elbow split при drag сегмента;
- add/remove path handle через context menu;
- add path handle на newly created inner segment;
- line / arrow / double arrow через endcaps.
