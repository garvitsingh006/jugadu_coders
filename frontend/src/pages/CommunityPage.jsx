import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/api';
import PodCard from '../components/PodCard';

export default function CommunityPage() {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetchCommunity();
    fetchPods();
  }, [id]);

  const fetchCommunity = async () => {
    try {
      const response = await api.get(`/community/${id}`);
      setCommunity(response.data.community);
    } catch (error) {
      console.error('Fetch community error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPods = async () => {
    try {
      const response = await api.get(`/pod/active?communityId=${id}`);
      setPods(response.data.pods);
    } catch (error) {
      console.error('Fetch pods error:', error);
    }
  };

  const handleJoin = async () => {
    try {
      await api.post(`/community/${id}/join`);
      setJoined(true);
      fetchCommunity();
    } catch (error) {
      console.error('Join error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Community not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {community.name}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {community.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-indigo-100 text-indigo-700 text-sm px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={handleJoin}
            disabled={joined}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {joined ? 'Joined' : 'Join Community'}
          </button>
        </div>

        <p className="text-gray-700 mb-6">{community.description}</p>

        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <span>{community.membersCount} members</span>
          <span className="capitalize">{community.visibility} community</span>
          {community.campus && <span>{community.campus}</span>}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Active Pods</h2>
        <Link
          to={`/create-pod/${id}`}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
        >
          Create Pod
        </Link>
      </div>

      {pods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pods.map((pod) => (
            <PodCard key={pod._id} pod={pod} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No active pods. Be the first to create one!</p>
        </div>
      )}
    </div>
  );
}
