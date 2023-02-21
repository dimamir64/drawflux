import React, { useState, createElement, useEffect, useRef } from 'react';
import { Stage, Layer, Rect, Group } from 'react-konva';
import { NextUIProvider } from '@nextui-org/react';
import { KonvaEventObject } from 'konva/lib/Node';
import NodeMenu from './components/NodeMenu';
import { Node } from './shared/utils/createNode';
import { selectNodes, nodesActions } from './stores/nodesSlice';
import { useAppDispatch, useAppSelector } from './stores/hooks';
import { ActionType, ACTION_TYPES } from './stores/actions';
import { NodeComponentProps } from './components/types';
import { KEYS } from './shared/keys';
import { CURSOR } from './shared/constants';
import { SHAPES } from './shared/shapes';
import { getElement, NodeStyle, Point } from './shared/element';
import { IoAddOutline, IoHandRightOutline } from 'react-icons/io5';
import Konva from 'konva';
import StyleMenu from './components/StyleMenu';
import type { MenuItem, NodeType } from './shared/element';
import SelectTool from './components/SelectTool';
import { getNormalizedPoints } from './shared/utils/draw';
import NodeTransformer from './components/NodeTransformer';
import { IRect } from 'konva/lib/types';

type ToolType = NodeType['type'] | 'hand' | 'select';

const defaultStyle: NodeStyle = {
  line: 'solid',
  color: 'black',
  size: 'medium',
};

type StyleMenuType = {
  open: boolean;
  style: NodeStyle;
};

const App = () => {
  const [toolType, setToolType] = useState<ToolType>('rectangle');
  const [draftNode, setDraftNode] = useState<NodeType | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<MenuItem[] | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [stageScale, setStageScale] = useState(100);
  const [styleMenu, setStyleMenu] = useState<StyleMenuType>({
    open: false,
    style: defaultStyle,
  });
  const [selectedNodes, setSelectedNodes] = useState<NodeType[]>([]);
  const [selectBoxSize, setSelectBoxSize] = useState<Point[] | null>(null);

  const { past, present, future } = useAppSelector(selectNodes);

  const nodes = present.nodes;

  const dispatch = useAppDispatch();

  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const nodeRef = useRef(null);

  useEffect(() => {
    if (selectBoxSize && transformerRef.current && nodeRef.current) {
      transformerRef.current.nodes([nodeRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectBoxSize]);

  useEffect(() => {
    if (selected.length === 1) {
      const node = nodes.find((node) => node.nodeProps.id === selected[0]);

      node && handleNodeChange({ ...node, style: styleMenu.style });
    }
  }, [styleMenu.style]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case KEYS.DELETE:
          if (!selected.length) return;
          dispatch(nodesActions.delete(selected));
          setDraftNode(null);
          break;
        case KEYS.ESCAPE:
          setDraftNode(null);
          setSelected([]);
          break;
      }
    };
    window.addEventListener('keyup', handleKeyDown);

    return () => {
      window.removeEventListener('keyup', handleKeyDown);
    };
  }, [selected]);

  const onNodeMenuAction = (type: ActionType) => {
    // dispatch({ type, payload: { id: node.nodeProps?.id } });

    setSelected([]);
  };

  const handleOnContextMenu = (
    e: KonvaEventObject<PointerEvent>,
    id: string,
  ) => {
    e.evt.preventDefault();

    const position = e.target.getPosition();

    setMenuPosition({ x: position?.x || 0, y: position?.y || 0 });

    const selectedNode = nodes.find((node) => node.nodeProps.id === id);

    if (selectedNode) {
      setSelected([id]);
    }
  };

  const updateNodePoints = (x: number, y: number) => {
    setDraftNode((prevNode) => {
      if (!prevNode) return prevNode;

      return {
        ...prevNode,
        nodeProps: {
          ...prevNode.nodeProps,
          points: [prevNode.nodeProps.points[0], { x, y }],
        },
      };
    });
  };

  const setCursorStyle = (
    e: KonvaEventObject<MouseEvent | TouchEvent | DragEvent>,
  ) => {
    const stage = e.target.getStage();

    if (!stage) return;

    if (toolType === 'hand') {
      stage.container().style.cursor = CURSOR.GRAB;
      return;
    }

    if (e.target !== stage && !draftNode) {
      const { cursorType } = e.target.attrs;
      const parentCursorStyle = e.target.parent?.attrs.cursorType;

      stage.container().style.cursor =
        cursorType || parentCursorStyle || CURSOR.DEFAULT;
    } else if (draftNode) {
      stage.container().style.cursor = CURSOR.CROSSHAIR;
    } else {
      stage.container().style.cursor = CURSOR.DEFAULT;
    }
  };

  const setIntersectingNodes = (stage: Konva.Stage) => {
    if (!selectBoxSize) return;

    const layer = stage.getChildren((child) => child.nodeType === 'Layer')[0];

    const otherChildren = layer.getChildren((child) => child.attrs.id);

    const { p1, p2 } = getNormalizedPoints(selectBoxSize[0], selectBoxSize[1]);

    const intersectedChildren = otherChildren.filter((child) =>
      Konva.Util.haveIntersection(
        { x: p1.x, y: p1.y, width: p2.x - p1.x, height: p2.y - p1.y },
        child.getClientRect(),
      ),
    );

    const childrenIds = new Set<string>(
      intersectedChildren.map(({ attrs }) => attrs.id),
    );

    const selectedNewChildren = [
      ...nodes.filter((node) => childrenIds.has(node.nodeProps.id)),
    ];
    console.log(selectedNewChildren);
    setSelectedNodes(selectedNewChildren);
  };

  const onMoveStart = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const stage = e.target.getStage();

    const clickedOnEmpty = e.target === stage;

    if (!clickedOnEmpty) {
      return;
    }

    const position = e.target.getStage()?.getRelativePointerPosition();

    if (!position) return;

    switch (toolType) {
      case 'hand':
        break;
      case 'select':
        setSelectBoxSize([position, position]);
        break;
      default:
        if (selected.length) break;
        setDraftNode(new Node(toolType, position.x, position.y));
    }

    setSelected([]);
    setSelectedNodes([]);
  };

  const onMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const position = e.target.getStage()?.getRelativePointerPosition();

    if (!position) return;

    switch (toolType) {
      case 'hand':
        break;
      case 'select':
        const stage = stageRef.current;

        stage && setIntersectingNodes(stage);

        setSelectBoxSize((prevSize) => {
          if (!prevSize) return prevSize;

          return [prevSize[0], position];
        });
        break;
      default:
        updateNodePoints(position.x, position.y);
    }

    setCursorStyle(e);
  };

  const onMoveEnd = () => {
    switch (toolType) {
      case 'hand':
        break;
      case 'select':
        setSelectBoxSize(null);
        break;
      default:
        if (!draftNode) break;

        dispatch(nodesActions.add([draftNode]));
        setDraftNode(null);
    }
  };

  const zoomStageRelativeToPointerPosition = (
    stage: Konva.Stage,
    event: WheelEvent,
  ) => {
    const oldScale = stage.scaleX();
    const pointer = stage.getRelativePointerPosition() || { x: 0, y: 0 };
    const scaleBy = 1.1;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const direction = event.deltaY > 0 ? -1 : 1;

    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };

    stage.position(newPos);

    setStageScale(Math.round(newScale * 100));
  };

  const onWheel = (e: KonvaEventObject<WheelEvent>) => {
    const stage = e.target.getStage();

    if (e.evt.ctrlKey && stage) {
      e.evt.preventDefault();
      zoomStageRelativeToPointerPosition(stage, e.evt);
    }
  };

  const handleNodeChange = (node: NodeType | null) => {
    if (!node) {
      setDraftNode(null);
      return;
    }
    if (draftNode) {
      dispatch(nodesActions.add([node]));

      setDraftNode(null);
    } else {
      dispatch(nodesActions.update([node]));
    }
  };

  const onNodeTypeChange = (type: ToolType) => {
    setToolType(type);
    setDraftNode(null);
    setSelected([]);
  };

  const onNodeSelect = (node: NodeType) => {
    setSelected([node.nodeProps.id]);

    setStyleMenu({
      open: styleMenu.open,
      style: node?.style,
    });
  };

  const onStyleMenuToggle = () => {
    if (selected) {
      const node = nodes.find((node) => node.nodeProps.id === selected[0]);

      node &&
        setStyleMenu({
          open: !styleMenu.open,
          style: node?.style,
        });
    } else {
      setStyleMenu({ ...styleMenu, open: !styleMenu.open });
    }
  };

  const handleGroupDragStart = (e: any) => {};

  const onGroupDragEnd = (e: KonvaEventObject<DragEvent>) => {
    const group = e.target as Konva.Group;

    const nodeMap = new Map<string, NodeType>([]);

    selectedNodes.forEach((node) => nodeMap.set(node.nodeProps.id, node));

    const children = [...group.getChildren()].map((child) => {
      const node = nodeMap.get(child.attrs.id);

      if (!node) return null;
      const { x, y } = child.getAbsolutePosition();

      return {
        ...node,
        nodeProps: {
          ...node.nodeProps,
          x: x,
          y: y,
        },
      };
    });

    dispatch(nodesActions.update(children));
  };

  const onGroupDrag = (e: KonvaEventObject<DragEvent>) => {
    const group = e.target as Konva.Group;
  };

  return (
    <NextUIProvider>
      <>
        <button onClick={() => onNodeTypeChange('hand')}>
          <span>Panning Tool</span>
          <IoHandRightOutline />
        </button>
        <button onClick={() => onNodeTypeChange('select')}>
          <span>Select</span>
          <IoAddOutline />
        </button>
        {Object.values(SHAPES).map((shape, i) => {
          return (
            <button key={i} onClick={() => onNodeTypeChange(shape.value)}>
              <span>{shape.value}</span>
              {createElement(shape.icon)}
            </button>
          );
        })}
        {styleMenu.open && (
          <StyleMenu
            style={styleMenu.style}
            onStyleChange={(updatedStyle) =>
              setStyleMenu({ ...styleMenu, style: updatedStyle })
            }
          />
        )}
        <button onClick={() => dispatch(nodesActions.deleteAll())}>
          Clear All
        </button>
        <button onClick={onStyleMenuToggle}>Styles</button>
        <div>
          <button
            disabled={!past.length}
            onClick={() => dispatch({ type: ACTION_TYPES.UNDO })}
          >
            Undo
          </button>
          <button
            disabled={!future.length}
            onClick={() => dispatch({ type: ACTION_TYPES.REDO })}
          >
            Redo
          </button>
        </div>
        <div>
          <span>Zoom: {stageScale}%</span>
        </div>
        <Stage
          ref={stageRef}
          width={window.innerWidth}
          height={window.innerHeight}
          onMouseDown={onMoveStart}
          onMouseMove={onMove}
          onMouseUp={onMoveEnd}
          onWheel={onWheel}
          style={{ backgroundColor: '#fafafa' }}
          draggable={toolType === 'hand'}
        >
          <Layer>
            {[...nodes, draftNode].map((node, index) => {
              if (!node) return null;
              return createElement(getElement(node), {
                key: index,
                nodeProps: node.nodeProps,
                type: node.type,
                text: node.text,
                style: node.style,
                selected: selected.includes(node.nodeProps.id),
                draggable: toolType !== 'hand',
                opacity: !selectedNodes.some(
                  (n) => n.nodeProps.id === node.nodeProps.id,
                )
                  ? 1
                  : 0,
                onContextMenu: handleOnContextMenu,
                onSelect: () => onNodeSelect(node),
                onNodeChange: handleNodeChange,
              } as NodeComponentProps);
            })}
            {selectBoxSize ? <SelectTool points={selectBoxSize} /> : null}
            {selectedNodes.length ? (
              <Group
                ref={nodeRef}
                onDragStart={handleGroupDragStart}
                onDragEnd={onGroupDragEnd}
                onDragMove={onGroupDrag}
              >
                {selectedNodes.map((node, index) => {
                  return createElement(getElement(node), {
                    key: index,
                    nodeProps: node.nodeProps,
                    type: node.type,
                    text: node.text,
                    style: { ...node.style, color: 'red' },
                    selected: false,
                    draggable: false,
                    onContextMenu: () => null,
                    onSelect: () => null,
                    onNodeChange: () => null,
                  } as NodeComponentProps);
                })}
              </Group>
            ) : null}
            {selectedNodes.length ? (
              <NodeTransformer ref={transformerRef} />
            ) : null}
          </Layer>
        </Stage>
        <NodeMenu
          isOpen={Boolean(contextMenu)}
          x={menuPosition.x}
          y={menuPosition.y}
          menuItems={contextMenu || []}
          onClose={() => setContextMenu(null)}
          onAction={(key) => onNodeMenuAction(key as ActionType)}
        />
      </>
    </NextUIProvider>
  );
};

export default App;
