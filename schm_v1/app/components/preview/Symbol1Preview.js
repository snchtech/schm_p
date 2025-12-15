import { Stage, Layer, Group, Line, Circle } from 'react-konva';

const Symbol1Preview = ({ width = 22, height = 22 }) => (
  <Stage width={width} height={height} style={{ width: "100%", height: "100%" }}>
    <Layer>
      <Group x={width * 0.1} y={height * 0.1} scale={{ x: 0.21, y: 0.21 }}>
        <Line points={[50.5, 13, 50.5, 64]} stroke="black" strokeWidth={3} />
        <Circle x={50.5} y={40.5} radius={5.5} fill="black" />
        <Line points={[6.5, 46, 6.5, 85]} stroke="black" strokeWidth={3} />
        <Line points={[51.5, 62.5, 6.5, 83.5]} stroke="black" strokeWidth={3} />
        <Line points={[5.5, 46.5, 50, 62]} stroke="black" strokeWidth={3} />
        <Line points={[93.2, 81.1, 92.5, 42.1]} stroke="black" strokeWidth={3} />
        <Line points={[47.9, 64.9, 92.5, 43.1]} stroke="black" strokeWidth={3} />
        <Line points={[94.2, 80.1, 47.5, 64.5]} stroke="black" strokeWidth={3} />
      </Group>
    </Layer>
  </Stage>
);
export default Symbol1Preview;