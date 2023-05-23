import type { NodeColor, NodeStyle } from 'shared';
import { ICON_SIZES } from '@/constants/icon';
import { ANIMATED, COLOR, LINE, SIZE } from '@/constants/style';
import { capitalizeFirstLetter } from '@/utils/string';
import {
  ColorButton,
  StyleButton,
  StyleContainer,
  StyleGrid,
  StyleRadioGroup,
  ToggleButton,
  StyleLabel,
} from './StylePanelStyled';

export type StylePanelProps = {
  active: boolean;
  style: Partial<NodeStyle>;
  enabledOptions: {
    line: boolean;
    size: boolean;
  };
  onStyleChange: (updatedStyle: Partial<NodeStyle>) => void;
};

const StylePanel = ({
  active,
  style,
  enabledOptions,
  onStyleChange,
}: StylePanelProps) => {
  const handleColorSelect = (color: NodeColor) => {
    onStyleChange({ color });
  };

  const handleLineSelect = (value: (typeof LINE)[number]['value']) => {
    onStyleChange({
      animated: style.animated && value !== 'solid' ? true : false,
      line: value,
    });
  };

  const handleAnimatedSelect = () => {
    onStyleChange({ animated: !style.animated });
  };

  const handleSizeSelect = (sizeName: (typeof SIZE)[number]['name']) => {
    const value = SIZE.find((s) => s.name === sizeName)?.value;

    onStyleChange({ size: value });
  };

  return (
    <StyleContainer active={active}>
      <StyleRadioGroup
        defaultValue={style.color}
        aria-label="Color"
        aria-labelledby="shape-color"
        orientation="horizontal"
        onValueChange={handleColorSelect}
      >
        <StyleLabel htmlFor="shape-color" css={{ fontSize: '$1' }}>
          Color
        </StyleLabel>
        <StyleGrid>
          {COLOR.map((color) => {
            return (
              <ColorButton
                key={color.value}
                title={capitalizeFirstLetter(color.name)}
                value={color.value}
                checked={color.value === style.color}
                color={
                  color.value === style.color ? 'secondary' : 'secondary-light'
                }
                style={{ color: color.value }}
              />
            );
          })}
        </StyleGrid>
      </StyleRadioGroup>
      {enabledOptions.line && (
        <>
          <StyleRadioGroup
            aria-label="Line"
            aria-labelledby="shape-line"
            orientation="horizontal"
            onValueChange={handleLineSelect}
          >
            <StyleLabel htmlFor="shape-line" css={{ fontSize: '$1' }}>
              Line
            </StyleLabel>
            <StyleGrid>
              {LINE.map((line) => {
                return (
                  <StyleButton
                    aria-label="Select Line"
                    key={line.value}
                    value={line.value}
                    title={line.name}
                    checked={line.value === style.line}
                    color={
                      line.value === style.line
                        ? 'secondary'
                        : 'secondary-light'
                    }
                  >
                    {line.icon({ size: ICON_SIZES.LARGE })}
                  </StyleButton>
                );
              })}
            </StyleGrid>
          </StyleRadioGroup>
          <div aria-labelledby="shape-animated">
            <StyleLabel htmlFor="shape-animated" css={{ fontSize: '$1' }}>
              Animated
            </StyleLabel>
            <ToggleButton
              aria-label="Toggle Animated"
              title={capitalizeFirstLetter(ANIMATED.value)}
              pressed={style.animated}
              color={style.animated ? 'primary' : 'secondary-light'}
              disabled={style.line === 'solid'}
              onPressedChange={handleAnimatedSelect}
            >
              {style.animated ? 'On' : 'Off'}
            </ToggleButton>
          </div>
        </>
      )}
      {enabledOptions.size && (
        <StyleRadioGroup
          aria-label="Size"
          aria-labelledby="shape-size"
          orientation="horizontal"
          onValueChange={handleSizeSelect}
        >
          <StyleLabel htmlFor="shape-size" css={{ fontSize: '$1' }}>
            Size
          </StyleLabel>
          <StyleGrid>
            {SIZE.map((size) => {
              return (
                <StyleButton
                  key={size.name}
                  title={capitalizeFirstLetter(size.name)}
                  value={size.name}
                  checked={size.value === style?.size}
                  color={
                    size.value === style?.size ? 'secondary' : 'secondary-light'
                  }
                >
                  {size.icon({ size: ICON_SIZES.LARGE })}
                </StyleButton>
              );
            })}
          </StyleGrid>
        </StyleRadioGroup>
      )}
    </StyleContainer>
  );
};

export default StylePanel;
