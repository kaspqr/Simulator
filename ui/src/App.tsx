import { Routes, Route } from 'react-router-dom'

import TemperatureChecker from './views/pages/TemperatureChecker';
import Layout from './components/Layout';
import Graph from './views/pages/Graph';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TemperatureChecker />} />
        <Route path="infograph/:id" element={<Graph />} />
      </Route>
    </Routes>
  );
};

export default App;
