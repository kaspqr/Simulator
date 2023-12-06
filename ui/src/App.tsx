import { Routes, Route } from 'react-router-dom'

import HealthRecorder from './views/pages/health-recorder/HealthRecorder';
import Layout from './views/components/layout/Layout';
import Graph from './views/pages/health-recorder/Graph';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HealthRecorder />} />
        <Route path="infograph/:id" element={<Graph />} />
      </Route>
    </Routes>
  );
};

export default App;
