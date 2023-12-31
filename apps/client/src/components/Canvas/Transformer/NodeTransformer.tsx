import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { TransformerConfig } from 'konva/lib/shapes/Transformer';
import { type PropsWithRef, forwardRef, useCallback } from 'react';
import { type KonvaNodeEvents, Transformer } from 'react-konva';
import { TRANSFORMER } from '@/constants/shape';
import { normalizeTransformerSize } from './helpers/size';
import useDefaultThemeColors from '@/hooks/useThemeColors';

export type TransformerProps = PropsWithRef<{
  transformerConfig?: TransformerConfig;
  transformerEvents?: KonvaNodeEvents;
}>;

type Ref = Konva.Transformer;

const NodeTransformer = forwardRef<Ref, TransformerProps>(
  ({ transformerConfig, transformerEvents }, ref) => {
    const themeColors = useDefaultThemeColors();

    const handleDragStart = useCallback(
      (event: KonvaEventObject<DragEvent>) => {
        event.target.visible(false);
      },
      [],
    );

    const handleDragEnd = useCallback((event: KonvaEventObject<DragEvent>) => {
      event.target.visible(true);
    }, []);

    return (
      <Transformer
        ref={ref}
        anchorFill={themeColors['canvas-bg'].value}
        anchorStroke={TRANSFORMER.BORDER_STROKE}
        borderStroke={TRANSFORMER.BORDER_STROKE}
        anchorStrokeWidth={TRANSFORMER.ANCHOR_STROKE_WIDTH}
        anchorSize={TRANSFORMER.ANCHOR_SIZE}
        anchorCornerRadius={TRANSFORMER.ANCHOR_CORNER_RADIUS}
        padding={TRANSFORMER.PADDING}
        rotateAnchorOffset={TRANSFORMER.ROTATION_ANCHOR_OFFSET}
        rotationSnaps={TRANSFORMER.ROTATION_SNAPS}
        ignoreStroke={true}
        shouldOverdrawWholeArea={true}
        boundBoxFunc={normalizeTransformerSize}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        {...transformerConfig}
        {...transformerEvents}
      />
    );
  },
);

NodeTransformer.displayName = 'NodeTransformer';

export default NodeTransformer;
