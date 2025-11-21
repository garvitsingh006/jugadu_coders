import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import CommunityCard from '../components/CommunityCard';

export default function Profile() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserCommunities();
  }, []);

  const fetchUserCommunities = async () => {
    try {
      const response = await api.get('/auth/me');
      setCommunities(response.data.user.joinedCommunities || []);
    } catch (error) {
      console.error('Fetch user communities error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card mb-8">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
            <span className="text-4xl text-green-400 font-bold">
              {user?.name.charAt(0)}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{user?.name}</h1>
            <p className="text-gray-300">{user?.email}</p>
            {user?.campus && (
              <p className="text-gray-400 mt-1">{user.campus}</p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">
                {communities.length}
              </p>
              <p className="text-sm text-gray-400">Communities Joined</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {user?.preferences?.defaultMode || 'Global'}
              </p>
              <p className="text-sm text-gray-400">Default Mode</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">
                {new Date(user?.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-400">Member Since</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          Your Communities
        </h2>
        {communities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <CommunityCard key={community._id} community={community} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card">
            <p className="text-gray-300">You haven't joined any communities yet.</p>
            <button
              onClick={() => window.location.href = '/search'}
              className="mt-4 btn-primary"
            >
              Search Communities
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
