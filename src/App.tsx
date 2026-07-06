import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AIAssistant from './pages/AIAssistant';
import PersonalCenter from './pages/PersonalCenter';
import Laws from './pages/Laws';
import Help from './pages/Help';
import KnowledgeGraph from './pages/KnowledgeGraph';
import HDModels from './pages/HDModels';
import HDVerification from './pages/HDVerification';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/personal-center" element={<PersonalCenter />} />
          <Route path="/laws" element={<Laws />} />
          <Route path="/help" element={<Help />} />
          <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
          <Route path="/hd-models" element={<HDModels />} />
          <Route path="/hd-verification" element={<HDVerification />} />
          {/* Fallback route for placeholders */}
          <Route path="*" element={
            <div className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
              <h2>该功能正在建设中 (Under Construction)</h2>
            </div>
          } />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
