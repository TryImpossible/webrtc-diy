// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Samples from './Samples';
import Camera from './Camera';
import Microphone from './Microphone';
import Canvas from './Canvas';
import ScreenSharing from './ScreenSharing';
import VideoFilter from './VideoFilter';
import Resolution from './Resolution';
import AudioVolume from './volume/AudioVolume';
import DeviceSelect from './DeviceSelect';
import MediaSettings from './media-settings/MediaSettings';
import MediaStreamAPI from './MediaStreamAPI';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Samples} exact />
        <Route path="/camera" Component={Camera} exact />
        <Route path="/microphone" Component={Microphone} exact />
        <Route path="/canvas" Component={Canvas} exact />
        <Route path="/screen-sharing" Component={ScreenSharing} exact />
        <Route path="/video-filter" Component={VideoFilter} exact />
        <Route path="/resolution" Component={Resolution} exact />
        <Route path="/audio-volume" Component={AudioVolume} exact />
        <Route path="/device-select" Component={DeviceSelect} exact />
        <Route path="/media-settings" Component={MediaSettings} exact />
        <Route path="/media-stream-api" Component={MediaStreamAPI} exact />
      </Routes>
    </Router>
  );
}

export default App;
