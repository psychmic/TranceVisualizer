import { HexColorInput, HexColorPicker } from "react-colorful";
import './styles.css';

interface PropTypes {
  color: string,
  setColor: React.Dispatch<React.SetStateAction<string>>
}

export default function ColorPicker({ color, setColor }: PropTypes) {
  return (
    <div className="color-picker">
      <HexColorPicker color={color} onChange={setColor} />
      <HexColorInput color={color} onChange={setColor} />
    </div>
  );
}