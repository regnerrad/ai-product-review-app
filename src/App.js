import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './pages/Home';
import Results from './pages/Results';
import Settings from './pages/Settings';
import ManageAffiliate from './pages/ManageAffiliate';
import Auth from './pages/Auth';
import History from './pages/History';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/manage-affiliate" element={<ManageAffiliate />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;