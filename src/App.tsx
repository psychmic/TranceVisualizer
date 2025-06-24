import BalatroSplash from "./components/BalatroSplash/BalatroSplash";
import BackgroundShader from "./components/BalatroBackground/BackgroundShader";
import './App.css';

function App() {
  return (
    <div className='wrapper'>
      <header>
        <h1 id="title"><a href="https://github.com/SpectralPack/Trance" target="blank">Trance</a><span>Visualizer</span></h1>
      </header>
      <main>
        <BalatroSplash />
        <BackgroundShader />
      </main>
    </div>
  );
}

export default App;
