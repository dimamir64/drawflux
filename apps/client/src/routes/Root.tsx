import type Konva from 'konva';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Loader from '@/components/core/Loader/Loader';
import Modal from '@/components/core/Modal/Modal';
import DrawingCanvas from '@/components/DrawingCanvas/DrawingCanvas';
import Panels from '@/components/Panels/Panels';
import { LOCAL_STORAGE, PageState, type PageStateType } from '@/constants/app';
import useKeydownListener from '@/hooks/useKeyListener';
import useWindowSize from '@/hooks/useWindowSize/useWindowSize';
import { useGetPageQuery } from '@/services/api';
import { useAppDispatch, useAppSelector } from '@/stores/hooks';
import { controlActions } from '@/stores/slices/controlSlice';
import { modalActions, selectModal } from '@/stores/slices/modalSlice';
import { nodesActions } from '@/stores/slices/nodesSlice';
import {
  selectStageConfig,
  stageConfigActions,
} from '@/stores/slices/stageConfigSlice';
import { getFromStorage } from '@/utils/storage';

const Root = () => {
  const { id } = useParams();
  const { isLoading, isError, isSuccess } = useGetPageQuery(
    {
      id: id as string, // Temporary workaround
    },
    { skip: !id },
  );

  const stageConfig = useAppSelector(selectStageConfig);
  const modal = useAppSelector(selectModal);

  const dispatch = useAppDispatch();

  const stageRef = useRef<Konva.Stage>(null);

  useKeydownListener();

  const [width, height] = useWindowSize();

  useEffect(() => {
    if (id) {
      return;
    }

    const stateFromStorage = getFromStorage<PageStateType>(LOCAL_STORAGE.KEY);

    if (stateFromStorage) {
      try {
        PageState.parse(stateFromStorage);
      } catch (error) {
        return;
      }

      const batchDispatchPageState = (state: PageStateType) => {
        const { control, nodes, stageConfig } = state.page;

        // Order of dispatch is important in dev mode
        // Cause is unknown, needs investigation
        dispatch(controlActions.set(control));
        dispatch(nodesActions.set(nodes));
        dispatch(stageConfigActions.set(stageConfig));
      };

      batchDispatchPageState(stateFromStorage);
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (isError) {
      dispatch(
        modalActions.open({ title: 'Error', message: 'Error loading page' }),
      );
    }
  }, [isError, dispatch]);

  if (isLoading) {
    return <Loader fullScreen={true}>Loading</Loader>;
  }

  return (
    <>
      <Panels isPageShared={isSuccess} stageRef={stageRef} />
      <DrawingCanvas
        ref={stageRef}
        config={{
          width,
          height,
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

export default Root;
