import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';

export default function Heatmap() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always fetch nearby using server-side IP detection (no map required)
    fetchNearbyByIP();
  }, []);

  const fetchNearbyByIP = async () => {
    try {
      const response = await api.get(`/community/nearby-by-ip?maxDistance=50000`);
      setCommunities(response.data.communities || []);
      setNearbyUsers(response.data.users || []);
    } catch (error) {
      console.error('Fetch nearby by IP error:', error);
    } finally {
      setLoading(false);
    }
  };

  const [nearbyUsers, setNearbyUsers] = useState([]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading nearby results...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Nearby People & Communities</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nearby Communities ({communities.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((community) => (
            <Link key={community._id} to={`/community/${community._id}`} className="block">
              <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <h3 className="font-semibold text-gray-800 mb-2">{community.name}</h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {community.tags.map((tag, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{community.membersCount} members</p>
                <p className="text-xs text-gray-500 mt-2">Created by: {community.createdBy?.name || 'Unknown'}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Nearby People ({nearbyUsers.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyUsers.map((user) => (
            <div key={user._id} className="flex items-center gap-4 bg-white rounded-lg shadow-sm p-4">
              <img src={user.photo || '/default-avatar.png'} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <div className="font-medium">{user.name}</div>
                <div className="text-sm text-gray-500">{user.campus || '—'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
