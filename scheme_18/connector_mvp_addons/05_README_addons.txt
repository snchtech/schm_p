CONNECTOR MVP 2.0 ADD-ONS
=========================

Що тут є:
1. 01_connector_body_drag_patch.txt
   - завершений комплект для перетягування всього конектора по canvas.
   - куди додавати:
     * connectorEditing.js
     * canvasController.js
     * ConnectorsLayer.jsx
     * useCanvasStore.js

2. 02_connectorAutoRouting.txt
   - новий модуль для:
     * smart reroute
     * obstacle avoidance
     * автообхід фігур
   - створити як окремий файл connectorAutoRouting.js

3. 03_connectorGeometry_autoroute_patch.txt
   - patch для connectorGeometry.js / connectorModel.js
   - додає autoRouting у route і вмикає побудову маршруту через obstacle avoidance

4. 04_canvasController_autoroute_patch.txt
   - керування smart reroute з контролера
   - enable / disable / rerouteNow / rerouteAffectedConnectorsForNode

Що важливо:
- body-drag у базовому пакеті вже частково є;
  цей add-on просто дає окремий зібраний patch.
- smart reroute краще вмикати для orthogonal-elbow.
- якщо в конектора вже є route.pathHandles, manual pathHandles мають пріоритет.
  Тобто auto-routing бажано не змішувати з ручними pathHandles у тому самому конекторі.

Рекомендований порядок інтеграції:
1. Спочатку перевір body-drag patch.
2. Потім додай connectorAutoRouting.js.
3. Потім patch у connectorModel.js / connectorGeometry.js.
4. Потім patch у canvasController.js.
5. Якщо хочеш авто-reroute при русі вузлів:
   викликай rerouteAffectedConnectorsForNode(nodeId) після updateNodePosition.

Що тестувати:
- вільний detached connector перетягується цілком;
- attached connector не перетягується як ціле;
- orthogonal-elbow з autoRouting=true обходить інші фігури;
- після руху node smart-routed connector перебудовується;
- якщо додано manual pathHandles, reroute не ламає ручну форму.
