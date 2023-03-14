import { createDefaultNodeConfig } from '@/client/shared/constants/element';
import useAnimatedLine from '@/client/shared/hooks/useAnimatedLine';
import useTransformer from '@/client/shared/hooks/useTransformer';
import Konva from 'konva';
import { Ellipse } from 'react-konva';
import NodeTransformer from '../../NodeTransformer';
import type { NodeComponentProps } from '@/client/components/Node/Node';

const CircleDrawable = ({
  node,
  selected,
  draggable,
  onNodeChange,
  onPress,
}: NodeComponentProps) => {
  const { nodeRef, transformerRef } = useTransformer<Konva.Ellipse>([selected]);

  useAnimatedLine(
    nodeRef.current,
    node.style.line[0] + node.style.line[1],
    node.style.animated,
    node.style.line,
  );

  const { nodeProps, style } = node;

  const config = createDefaultNodeConfig({
    visible: nodeProps.visible,
    strokeWidth: node.style.size,
    stroke: style.color,
    id: nodeProps.id,
    rotation: nodeProps.rotation,
    opacity: style.opacity,
    draggable,
    dash: node.style.line,
  });

  return (
    <>
      <Ellipse
        ref={nodeRef}
        radiusX={node.nodeProps.width || 0}
        radiusY={node.nodeProps.height || 0}
        x={node.nodeProps.point[0]}
        y={node.nodeProps.point[1]}
        {...config}
        onDragStart={() => onPress(node.nodeProps.id)}
        onDragEnd={(event) => {
          onNodeChange({
            ...node,
            nodeProps: {
              ...node.nodeProps,
              point: [event.target.x(), event.target.y()],
            },
          });
        }}
        onTransformEnd={(event) => {
          const ellipse = event.target as Konva.Ellipse;

          const radiusX = (ellipse.width() * ellipse.scaleX()) / 2;
          const radiusY = (ellipse.height() * ellipse.scaleY()) / 2;

          onNodeChange({
            ...node,
            nodeProps: {
              ...node.nodeProps,
              point: [ellipse.x(), ellipse.y()],
              width: radiusX,
              height: radiusY,
              rotation: ellipse.rotation(),
            },
          });

          ellipse.scale({ x: 1, y: 1 });
        }}
        onTap={() => onPress(node.nodeProps.id)}
        onClick={() => onPress(node.nodeProps.id)}
      />
      {selected && <NodeTransformer ref={transformerRef} />}
    </>
  );
};

export default CircleDrawable;
