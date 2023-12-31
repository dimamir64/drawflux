import type { NodeObject, NodeType } from 'shared';
import ArrowDrawable from '@/components/Canvas/Shapes/ArrowDrawable/ArrowDrawable';
import EllipseDrawable from '@/components/Canvas/Shapes/EllipseDrawable/EllipseDrawable';
import FreePathDrawable from '@/components/Canvas/Shapes/FreePathDrawable/FreePathDrawable';
import RectDrawable from '@/components/Canvas/Shapes/RectDrawable/RectDrawable';
import EditableText from '../Shapes/EditableText/EditableText';

export type NodeComponentProps<Type extends NodeType = NodeType> = {
  node: NodeObject<Type>;
  selected: boolean;
  stageScale: number;
  onNodeChange: (node: NodeObject<Type>) => void;
};

const elements = {
  arrow: ArrowDrawable,
  rectangle: RectDrawable,
  ellipse: EllipseDrawable,
  draw: FreePathDrawable,
  text: EditableText,
};

const Node = <T extends NodeType>({
  node,
  ...restProps
}: NodeComponentProps<T>) => {
  const Element: React.ElementType = elements[node.type];

  return <Element node={node} {...restProps} />;
};

export default Node;
