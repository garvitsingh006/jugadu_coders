import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
import Nearby from './pages/Nearby';
import Explore from './pages/Explore';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 -z-10">
              <div className="absolute inset-0 bg-gray-950" />
              <div className="absolute top-0 -left-4 w-96 h-96 bg-emerald-600/10 rounded-full filter blur-3xl opacity-40 animate-blob" />
              <div className="absolute top-0 -right-4 w-96 h-96 bg-teal-600/10 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
              <div className="absolute -bottom-8 left-20 w-96 h-96 bg-green-600/10 rounded-full filter blur-3xl opacity-40 animate-blob animation-delay-4000" />
            </div>
            
            <Navbar />
            <main className="relative z-10">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/search-result" element={<SearchResult />} />
                <Route path="/community/:id" element={<CommunityPage />} />
                <Route path="/create-pod/:communityId" element={<CreatePod />} />
                <Route path="/pod/:id" element={<PodLiveRoom />} />
                <Route path="/nearby" element={<Nearby />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
            
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                },
              }}
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
