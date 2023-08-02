import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCallback, useRef } from 'react';
import { Text } from 'react-konva';
import type { NodeComponentProps } from '@/components/Canvas/Node/Node';
import useNode from '@/hooks/useNode/useNode';
import useTransformer from '@/hooks/useTransformer';
import { getColorValue, getSizeValue } from '@/utils/shape';
import NodeTransformer from '../../Transformer/NodeTransformer';
import { getFontSize } from './helpers/font';
import { TEXT } from '@/constants/shape';
import { getNodeSize } from './helpers/size';
import { createSingleClickHandler } from '@/utils/timed';

type Props = {
  onDoubleClick: (event: KonvaEventObject<PointerEvent>) => void;
} & NodeComponentProps;

const ResizableText = ({
  node,
  selected,
  stageScale,
  onNodeChange,
  onPress,
  onDoubleClick,
}: Props) => {
  const { nodeRef, transformerRef } = useTransformer<Konva.Text>([selected]);

  const { config } = useNode(node, stageScale, {
    fillEnabled: true,
    strokeWidth: 0,
    fontSize: getFontSize(getSizeValue(node.style.size)),
    fill: getColorValue(node.style.color),
    fontFamily: TEXT.FONT_FAMILY,
    dash: [],
  });

  const singleClickHandler = useRef(
    createSingleClickHandler((callback) => callback()),
  );

  const handleOnPress = useCallback(() => {
    onPress(node.nodeProps.id);
  }, [node, onPress]);

  const handleDragEnd = useCallback(
    (event: KonvaEventObject<DragEvent>) => {
      onNodeChange({
        ...node,
        nodeProps: {
          ...node.nodeProps,
          point: [event.target.x(), event.target.y()],
        },
      });

      if (!selected) {
        onPress(node.nodeProps.id);
      }
    },
    [node, selected, onNodeChange, onPress],
  );

  const handleTransform = useCallback((event: KonvaEventObject<Event>) => {
    const textNode = event.target as Konva.Text;

    textNode.width(getNodeSize(textNode.width(), textNode.scaleX()));
    textNode.scale({ x: 1, y: 1 });
  }, []);

  const handleTransformEnd = useCallback(
    (event: KonvaEventObject<Event>) => {
      const textNode = event.target as Konva.Text;
      const joinedText = textNode.textArr.map(({ text }) => text).join('\n');

      onNodeChange({
        ...node,
        text: joinedText,
        nodeProps: {
          ...node.nodeProps,
          point: [textNode.x(), textNode.y()],
          width: getNodeSize(textNode.width(), textNode.scaleX()),
          height: getNodeSize(textNode.height(), textNode.scaleY()),
          rotation: textNode.rotation(),
        },
      });

      textNode.scale({ x: 1, y: 1 });
    },
    [node, onNodeChange],
  );

  // Prevents triggering ContextMenu on double click (touch devices)
  const handleTransformerPointerDown = useCallback(
    (event: KonvaEventObject<PointerEvent>) => {
      if (event.evt.pointerType === 'mouse') {
        return;
      }

      event.evt.stopPropagation();
      const stage = event.target?.getStage();

      if (stage) {
        singleClickHandler.current(() =>
          stage.container().dispatchEvent(event.evt),
        );
      }
    },
    [],
  );

  return (
    <>
      <Text
        ref={nodeRef}
        x={node.nodeProps.point[0]}
        y={node.nodeProps.point[1]}
        text={node.text ?? ''}
        lineHeight={TEXT.LINE_HEIGHT}
        padding={TEXT.PADDING}
        fontStyle={TEXT.FONT_WEIGHT}
        {...config}
        onDragEnd={handleDragEnd}
        onTransform={handleTransform}
        onTransformEnd={handleTransformEnd}
        onTap={handleOnPress}
        onClick={handleOnPress}
      />
      {selected && (
        <NodeTransformer
          ref={transformerRef}
          transformerConfig={{
            enabledAnchors: ['middle-left', 'middle-right'],
          }}
          transformerEvents={{
            onPointerDblClick: onDoubleClick,
            onPointerDown: handleTransformerPointerDown,
          }}
        />
      )}
    </>
  );
};

export default ResizableText;
