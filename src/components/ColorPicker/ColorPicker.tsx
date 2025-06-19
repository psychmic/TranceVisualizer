import { HexColorInput, HexColorPicker } from "react-colorful";
import './styles.css';

interface PropTypes {
  label: string,
  color: string,
  setColor: React.Dispatch<React.SetStateAction<string>>
}

export default function ColorPicker({ label, color, setColor }: PropTypes) {
  return (
    <div className="color-picker">
      <label>{label}</label>
      <HexColorPicker color={color} onChange={setColor} />
      <HexColorInput color={color} onChange={setColor} prefixed={true}/>
    </div>
  );
}