import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AIAssistant from './pages/AIAssistant';
import PersonalCenter from './pages/PersonalCenter';
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
