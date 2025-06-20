import { useRef } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import resetIcon from "../../assets/refresh.svg";
import './ColorPicker.css';

interface PropTypes {
  label: string,
  color: string,
  setColor: React.Dispatch<React.SetStateAction<string>>
}

export default function ColorPicker({ label, color, setColor }: PropTypes) {
  const initialColor = useRef(color);

  const resetColor = () => setColor(initialColor.current);

  return (
    <div className="color-picker">
      <label>{label}</label>
      <HexColorPicker color={color} onChange={setColor} />
      <div className="color-input-wrapper">
        <HexColorInput color={color} onChange={setColor} prefixed={true}/>
        <button onClick={resetColor}>
          <img src={resetIcon} alt="Reset"/>
        </button>
      </div>
    </div>
  );
}