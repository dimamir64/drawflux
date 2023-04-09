import { useRef } from 'react';
import { useAppDispatch, useAppSelector } from './stores/hooks';
import DrawingCanvas from './components/Stage/DrawingCanvas';
import {
  selectStageConfig,
  stageConfigActions,
} from './stores/slices/stageConfigSlice';
import Panels from './components/Panels/Panels';
import Konva from 'konva';
import Modal from '@/components/core/Modal/Modal';
import { modalActions, selectModal } from './stores/slices/modalSlice';
import useKeydownListener from './hooks/useKeyListener';

const App = () => {
  const stageConfig = useAppSelector(selectStageConfig);
  const modal = useAppSelector(selectModal);

  const dispatch = useAppDispatch();

  const stageRef = useRef<Konva.Stage>(null);

  useKeydownListener();

  return (
    <>
      <Panels stageRef={stageRef} />
      <DrawingCanvas
        ref={stageRef}
        config={{
          width: window.innerWidth,
          height: window.innerHeight,
          scale: { x: stageConfig.scale, y: stageConfig.scale },
          x: stageConfig.position.x,
          y: stageConfig.position.y,
        }}
        onConfigChange={(config) => dispatch(stageConfigActions.set(config))}
      />
      {modal.open && (
        <Modal
          title={modal.title}
          message={modal.message}
          onClose={() => dispatch(modalActions.close())}
        />
      )}
    </>
  );
};

export default App;
