import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { useGeolocation } from '../hooks/useGeolocation';
import Map from '../components/Map';

export default function Heatmap() {
  const { location } = useGeolocation();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location) {
      fetchNearbyCommunities();
    }
  }, [location]);

  const fetchNearbyCommunities = async () => {
    try {
      const response = await api.get(
        `/community/nearby?lng=${location.lng}&lat=${location.lat}&maxDistance=50000`
      );
      setCommunities(response.data.communities);
    } catch (error) {
      console.error('Fetch nearby error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !location) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Community Heatmap</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <Map
          center={location}
          markers={communities.map(c => ({
            id: c._id,
            position: {
              lat: c.location.coordinates[1],
              lng: c.location.coordinates[0]
            },
            title: c.name
          }))}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Nearby Communities ({communities.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {communities.map((community) => (
            <div
              key={community._id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
            >
              <h3 className="font-semibold text-gray-800 mb-2">
                {community.name}
              </h3>
              <div className="flex flex-wrap gap-2 mb-2">
                {community.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600">{community.membersCount} members</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
