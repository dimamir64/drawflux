import type Konva from 'konva';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type StageConfig } from 'shared';
import DrawingCanvas from '@/components/Canvas/DrawingCanvas/DrawingCanvas';
import {
  getNodesIntersectingWithRect,
  getPointerRect,
} from '@/components/Canvas/DrawingCanvas/helpers/stage';
import ContextMenu from '@/components/ContextMenu/ContextMenu';
import Dialog from '@/components/Elements/Dialog/Dialog';
import Panels from '@/components/Panels/Panels';
import { NODES_LAYER_INDEX } from '@/constants/shape';
import { useModal } from '@/contexts/modal';
import useKbdShortcuts from '@/hooks/useKbdShortcuts';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { canvasActions, selectCanvas } from '@/stores/slices/canvas';
import * as Styled from './MainLayout.styled';

type Props = {
  viewportSize: {
    width: number;
    height: number;
  };
};

const MainLayout = ({ viewportSize }: Props) => {
  const [intersectedNodesIds, setIntersectedNodesIds] = useState<string[]>([]);

  const { stageConfig, selectedNodesIds, nodes, toolType } =
    useAppSelector(selectCanvas);

  const modal = useModal();

  const stageRef = useRef<Konva.Stage>(null);

  const dispatch = useAppDispatch();

  const canvasConfig = useMemo(() => {
    const scale = { x: stageConfig.scale, y: stageConfig.scale };
    return { scale, ...stageConfig.position, ...viewportSize };
  }, [stageConfig, viewportSize]);

  useKbdShortcuts(
    stageRef.current?.container() || null,
    intersectedNodesIds,
    toolType,
  );

  useEffect(() => {
    setIntersectedNodesIds(Object.keys(selectedNodesIds));
  }, [selectedNodesIds]);

  const handleStageConfigChange = (config: Partial<StageConfig>) => {
    dispatch(canvasActions.setStageConfig(config));
  };

  const handleNodesIntersection = (nodesIds: string[]) => {
    setIntersectedNodesIds(nodesIds);
  };

  const handleContextMenuOpen = useCallback(
    (open: boolean) => {
      const stage = stageRef.current;

      if (!stage || !nodes.length || !open) {
        return;
      }

      const pointerPosition = stage.getPointerPosition();

      if (!pointerPosition) {
        return;
      }

      const layer = stage.getLayers()[NODES_LAYER_INDEX];

      const pointerRect = getPointerRect(pointerPosition, stageConfig.scale);
      const nodesInClickArea = getNodesIntersectingWithRect(
        layer,
        nodes,
        pointerRect,
      );

      const multipleNodesSelected = intersectedNodesIds.length > 1;
      const clickedOnNodes = !!nodesInClickArea.length;
      const clickedOnSelectedNodes = nodesInClickArea.some((node) =>
        intersectedNodesIds.includes(node.id()),
      );

      if (clickedOnNodes && !clickedOnSelectedNodes && !multipleNodesSelected) {
        dispatch(
          canvasActions.setSelectedNodesIds(
            nodesInClickArea.map((node) => node.id()),
          ),
        );
      }
    },
    [nodes, stageConfig.scale, intersectedNodesIds, dispatch],
  );

  return (
    <Styled.Container tabIndex={0}>
      <Panels intersectedNodesIds={intersectedNodesIds} stageRef={stageRef} />
      <ContextMenu
        selectedNodesCount={Object.keys(selectedNodesIds).length}
        onContextMenuOpen={handleContextMenuOpen}
      >
        <DrawingCanvas
          ref={stageRef}
          config={canvasConfig}
          intersectedNodesIds={intersectedNodesIds}
          onNodesIntersection={handleNodesIntersection}
          onConfigChange={handleStageConfigChange}
        />
      </ContextMenu>
      <Dialog
        open={modal.opened}
        title={modal.title}
        description={modal.description}
        onClose={modal.close}
      />
    </Styled.Container>
  );
};

export default MainLayout;