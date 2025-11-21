import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import CommunityCard from '../components/CommunityCard';
import PodCard from '../components/PodCard';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [activePods, setActivePods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      const [trendingRes, podsRes] = await Promise.all([
        api.get('/community/trending'),
        api.get('/pod/active')
      ]);
      setTrending(trendingRes.data.communities);
      setActivePods(podsRes.data.pods);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to VibeCircle, {user?.name}!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Find your community, join live pods, and connect with people
        </p>
        <Link
          to="/search"
          className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-indigo-700"
        >
          Search Communities
        </Link>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Trending Communities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trending.slice(0, 6).map((community) => (
            <CommunityCard key={community._id} community={community} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Pods</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activePods.slice(0, 8).map((pod) => (
            <PodCard key={pod._id} pod={pod} />
          ))}
        </div>
      </div>
    </div>
  );
}
