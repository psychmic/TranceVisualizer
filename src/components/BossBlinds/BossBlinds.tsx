import './BossBlinds.css';

const bossBlinds = [
  { name: 'Small Blind', color: '#000000' },
  { name: 'Big Blind', color: '#000000' },
  { name: 'The Ox', color: '#b95b08' },
  { name: 'The Hook', color: '#a84024' },
  { name: 'The Mouth', color: '#ae718e' },
  { name: 'The Fish', color: '#3e85bd' },
  { name: 'The Club', color: '#b9cb92' },
  { name: 'The Manacle', color: '#575757' },
  { name: 'The Tooth', color: '#b52d2d' },
  { name: 'The Wall', color: '#8a59a5' },
  { name: 'The House', color: '#5186a8' },
  { name: 'The Mark', color: '#6a3847' },
  { name: 'Cerulean Bell', color: '#009cfd' },
  { name: 'The Wheel', color: '#50bf7c' },
  { name: 'The Arm', color: '#6865f3' },
  { name: 'The Psychic', color: '#efc03c' },
  { name: 'The Goad', color: '#b95c96' },
  { name: 'The Water', color: '#c6e0eb' },
  { name: 'The Eye', color: '#4b71e4' },
  { name: 'The Plant', color: '#709284' },
  { name: 'The Needle', color: '#5c6e31' },
  { name: 'The Head', color: '#ac9db4' },
  { name: 'Verdant Leaf', color: '#56a786' },
  { name: 'Violet Vessel', color: '#8a71e1' },
  { name: 'The Window', color: '#a9a295' },
  { name: 'The Serpent', color: '#439a4f' },
  { name: 'The Pillar', color: '#7e6752' },
  { name: 'The Flint', color: '#e56a2f' },
  { name: 'Amber Acorn', color: '#fda200' },
  { name: 'Crimson Heart', color: '#ac3232' },
];

interface PropTypes {
  selectedBlind: string,
  setSelectedBlind: React.Dispatch<React.SetStateAction<string>>
}

export default function BossBlinds({ selectedBlind, setSelectedBlind }: PropTypes) {

  return (
    <div id="boss-blinds">
      {bossBlinds.map((bossBlind) => 
        <button 
          key={bossBlind.name}
          onClick={() => setSelectedBlind(bossBlind.name)}
          id={selectedBlind === bossBlind.name ? 'selected-blind' : ''}
          className="blind-button"
        >
          {bossBlind.name}
        </button>
      )}
    </div>
  );
}