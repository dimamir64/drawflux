import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCallback, useMemo } from 'react';
import { Rect } from 'react-konva';
import type { NodeComponentProps } from '@/components/Canvas/Node/Node';
import NodeTransformer from '@/components/Canvas/NodeTransformer';
import { RECT } from '@/constants/shape';
import useAnimatedDash from '@/hooks/useAnimatedDash/useAnimatedDash';
import useNode from '@/hooks/useNode/useNode';
import useTransformer from '@/hooks/useTransformer';
import { useAppSelector } from '@/stores/hooks';
import { selectCanvas } from '@/stores/slices/canvas';
import { calculatePerimeter } from '@/utils/math';
import { getDashValue, getSizeValue } from '@/utils/shape';
import { getRectSize } from './helpers/calc';

const RectDrawable = ({
  node,
  selected,
  draggable,
  onNodeChange,
  onPress,
}: NodeComponentProps) => {
  const { nodeRef, transformerRef } = useTransformer<Konva.Rect>([selected]);
  const { stageConfig } = useAppSelector(selectCanvas);
  const { config } = useNode(node, stageConfig);

  const totalDashLength = config.dash.length
    ? config.dash[0] + config.dash[1]
    : 0;

  const { animation } = useAnimatedDash({
    enabled: node.style.animated,
    elementRef: nodeRef,
    totalDashLength,
  });

  const handleDragEnd = useCallback(
    (event: KonvaEventObject<DragEvent>) => {
      onNodeChange({
        ...node,
        nodeProps: {
          ...node.nodeProps,
          point: [event.target.x(), event.target.y()],
        },
      });
      onPress(node.nodeProps.id);
    },
    [node, onNodeChange, onPress],
  );

  const handleTransformStart = useCallback(() => {
    if (node.style.animated && animation) {
      animation.stop();
    }
  }, [node.style.animated, animation]);

  const handlTransform = useCallback(
    (event: KonvaEventObject<Event>) => {
      const rect = event.target as Konva.Rect;

      const { width, height } = getRectSize(rect);

      const totalLength = calculatePerimeter(width, height, RECT.CORNER_RADIUS);

      const dash = getDashValue(
        totalLength,
        getSizeValue(node.style.size),
        node.style.line,
      );

      rect.scale({ x: 1, y: 1 });

      rect.width(width);
      rect.height(height);
      rect.dash(dash.map((d) => d * stageConfig.scale));
    },
    [node.style.size, node.style.line, stageConfig.scale],
  );

  const handleTransformEnd = useCallback(
    (event: KonvaEventObject<Event>) => {
      const rect = event.target as Konva.Rect;

      const { width, height } = getRectSize(rect);

      onNodeChange({
        ...node,
        nodeProps: {
          ...node.nodeProps,
          point: [rect.x(), rect.y()],
          width,
          height,
          rotation: rect.rotation(),
        },
      });

      rect.scale({ x: 1, y: 1 });

      if (node.style.animated && animation?.isRunning() === false) {
        animation.start();
      }
    },
    [node, animation, onNodeChange],
  );

  // Sanitize rect size
  const { width, height } = useMemo(() => {
    return {
      width: Math.max(
        Number(node.nodeProps.width ?? RECT.MIN_SIZE),
        RECT.MIN_SIZE,
      ),
      height: Math.max(
        Number(node.nodeProps.height ?? RECT.MIN_SIZE),
        RECT.MIN_SIZE,
      ),
    };
  }, [node.nodeProps.width, node.nodeProps.height]);

  return (
    <>
      <Rect
        ref={nodeRef}
        {...config}
        x={node.nodeProps.point[0]}
        y={node.nodeProps.point[1]}
        width={width}
        height={height}
        cornerRadius={RECT.CORNER_RADIUS}
        draggable={draggable}
        onDragEnd={handleDragEnd}
        onTransformStart={handleTransformStart}
        onTransform={handlTransform}
        onTransformEnd={handleTransformEnd}
        onTap={() => onPress(node.nodeProps.id)}
        onClick={() => onPress(node.nodeProps.id)}
      />
      {selected && (
        <NodeTransformer
          ref={transformerRef}
          transformerConfig={{
            id: node.nodeProps.id,
            keepRatio: false,
          }}
        />
      )}
    </>
  );
};

export default RectDrawable;