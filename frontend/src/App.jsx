import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Search from './pages/Search';
import SearchResult from './pages/SearchResult';
import CommunityPage from './pages/CommunityPage';
import CreatePod from './pages/CreatePod';
import PodLiveRoom from './pages/PodLiveRoom';
import Heatmap from './pages/Heatmap';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/search-result" element={<SearchResult />} />
              <Route path="/community/:id" element={<CommunityPage />} />
              <Route path="/create-pod/:communityId" element={<CreatePod />} />
              <Route path="/pod/:id" element={<PodLiveRoom />} />
              <Route path="/heatmap" element={<Heatmap />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
