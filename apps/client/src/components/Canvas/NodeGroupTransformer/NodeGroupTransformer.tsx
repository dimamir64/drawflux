import type Konva from 'konva';
import { useCallback } from 'react';
import { Group } from 'react-konva';
import type { NodeObject } from 'shared';
import Node from '@/components/Canvas/Node/Node';
import useForceUpdate from '@/hooks/useForceUpdate/useForceUpdate';
import useTransformer from '@/hooks/useTransformer';
import { getPointsAbsolutePosition } from '@/utils/position';
import NodeTransformer from '../NodeTransformer';

type Props = {
  nodes: NodeObject[];
  draggable: boolean;
  onDragEnd: (nodes: NodeObject[]) => void;
};

const NodeGroupTransformer = ({ nodes, draggable, onDragEnd }: Props) => {
  // Solves the issue when a nested group inside a tranformer is not updated properly when changed
  // Forces transformer to rerender with the updated nodes
  const { rerenderCount } = useForceUpdate([nodes]);

  const { transformerRef, nodeRef } = useTransformer<Konva.Group>([
    nodes,
    rerenderCount,
  ]);

  const setVisibility = useCallback(
    (group: Konva.Group, transformer: Konva.Transformer, dragging = false) => {
      const layer = nodeRef.current?.getLayer();

      const selectedLayerChildren = layer?.getChildren((child) =>
        nodes.some((node) => node.nodeProps.id === child.id()),
      );

      selectedLayerChildren?.forEach((child) => {
        child.visible(dragging ? false : true);
      });

      group.visible(dragging);

      setTimeout(() => transformer.visible(dragging ? false : true));
    },
    [nodeRef, nodes],
  );

  const handleDragStart = useCallback(() => {
    if (!transformerRef.current || !nodeRef.current) return;

    const transformer = transformerRef.current;
    const group = nodeRef.current;

    setVisibility(group, transformer, true);
  }, [setVisibility, nodeRef, transformerRef]);

  const handleDragEnd = useCallback(() => {
    if (!transformerRef.current || !nodeRef.current) return;

    const transformer = transformerRef.current;
    const group = nodeRef.current;
    const stage = group.getStage() as Konva.Stage;
    const children = group.getChildren();

    const nodesMap = new Map<string, NodeObject>(
      nodes.map((node) => [node.nodeProps.id, node]),
    );

    const updatedNodes = children
      .map((child) => {
        const node = nodesMap.get(child.id());

        if (!node) return;

        if (node.nodeProps.points) {
          const points = [node.nodeProps.point, ...node.nodeProps.points];

          const updatedPoints = getPointsAbsolutePosition(points, child, stage);

          return {
            ...node,
            nodeProps: {
              ...node.nodeProps,
              point: updatedPoints[0],
              points: updatedPoints.slice(1),
            },
          };
        }

        const { x, y } = child.getAbsolutePosition(stage);

        return {
          ...node,
          nodeProps: { ...node.nodeProps, point: [x, y] },
        };
      })
      .filter(Boolean) as NodeObject[];

    onDragEnd(updatedNodes);

    group.position({ x: 0, y: 0 });

    setVisibility(group, transformer);
  }, [nodes, nodeRef, transformerRef, setVisibility, onDragEnd]);

  return (
    <>
      <Group
        ref={nodeRef}
        visible={false}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        draggable={draggable}
        listening={draggable}
      >
        {nodes.map((node) => {
          return (
            <Node
              key={node.nodeProps.id}
              node={node}
              selected={false}
              draggable={false}
              onPress={() => null}
              onNodeChange={() => null}
            />
          );
        })}
      </Group>
      <NodeTransformer
        ref={transformerRef}
        transformerConfig={{
          enabledAnchors: [],
          rotateEnabled: false,
          resizeEnabled: false,
          listening: draggable,
          draggable,
        }}
        transformerEvents={{ onDragEnd: undefined, onDragStart: undefined }}
      />
    </>
  );
};

export default NodeGroupTransformer;