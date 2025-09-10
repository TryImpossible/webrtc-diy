// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Samples from './Samples';
import Camera from './Camera';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" Component={Samples} exact />
        <Route path="/camera" Component={Camera} exact />
      </Routes>
    </Router>
  );
}

export default App;
