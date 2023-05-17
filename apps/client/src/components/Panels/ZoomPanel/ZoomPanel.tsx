import { ICON_SIZES } from '@/constants/icon';
import { ZOOM, ZOOM_RANGE, type ZoomAction } from '@/constants/zoom';
import { PanelButton, Panel } from '../PanelsStyled';

type Props = {
  value: number;
  onZoomChange: (value: number) => void;
};

const ZoomPanel = ({ value, onZoomChange }: Props) => {
  const stageScalePercent = `${Math.round(value * 100)}%`;

  const getScaleValueByAction = (currentValue: number, action: ZoomAction) => {
    switch (action) {
      case 'increase':
        return Math.min(currentValue + 0.1, ZOOM_RANGE.MAX);
      case 'decrease':
        return Math.max(currentValue - 0.1, ZOOM_RANGE.MIN);
      case 'reset':
        return 1;
      default:
        return 1;
    }
  };

  const handleZoomAction = (action: ZoomAction) => {
    const newValue = getScaleValueByAction(value, action);
    onZoomChange(newValue);
  };

  return (
    <Panel>
      <PanelButton
        disabled={value === 1}
        title={ZOOM.RESET.name}
        css={{ fontSize: '$1', width: 'calc($5 * 2)' }}
        squared={false}
        onClick={() => handleZoomAction(ZOOM.RESET.value)}
      >
        {stageScalePercent}
      </PanelButton>
      <PanelButton
        disabled={value === ZOOM_RANGE.MAX}
        title={ZOOM.IN.name}
        onClick={() => handleZoomAction(ZOOM.IN.value)}
      >
        {ZOOM.IN.icon({ size: ICON_SIZES.SMALL })}
      </PanelButton>
      <PanelButton
        disabled={value === ZOOM_RANGE.MIN}
        title={ZOOM.OUT.name}
        onClick={() => handleZoomAction(ZOOM.OUT.value)}
      >
        {ZOOM.OUT.icon({ size: ICON_SIZES.SMALL })}
      </PanelButton>
    </Panel>
  );
};

export default ZoomPanel;
