import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/api';
import PodCard from '../components/PodCard';
import Toast from '../components/Toast';

export default function CommunityPage() {
  const { id } = useParams();
  const [community, setCommunity] = useState(null);
  const [pods, setPods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCommunity();
    fetchPods();
  }, [id]);

  const fetchCommunity = async () => {
    try {
      const response = await api.get(`/community/${id}`);
      setCommunity(response.data.community);
      setJoined(!!response.data.isMember);
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
      const response = await api.post(`/community/${id}/join`);
      // If user was already joined, backend returns alreadyJoined: true
      const alreadyJoined = response.data?.alreadyJoined;
      setJoined(!alreadyJoined);
      fetchCommunity();
      setToast({ id: Date.now(), message: alreadyJoined ? 'You are already a member' : 'Joined community', type: 'success' });
    } catch (error) {
      console.error('Join error:', error);
      setToast({ id: Date.now(), message: 'Failed to join community', type: 'error' });
    }
  };

  const handleLeave = async () => {
    // Ask for confirmation before leaving
    const ok = window.confirm('Are you sure you want to leave this community?');
    if (!ok) return;

    try {
      const response = await api.post(`/community/${id}/leave`);
      const alreadyLeft = response.data?.alreadyLeft;
      setJoined(!alreadyLeft);
      fetchCommunity();
      setToast({ id: Date.now(), message: alreadyLeft ? 'You are not a member' : 'Left community', type: 'success' });
    } catch (error) {
      console.error('Leave error:', error);
      setToast({ id: Date.now(), message: 'Failed to leave community', type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!community) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white">Community not found</h2>
      </div>
    );
  }

  const handleCloseToast = (id) => {
    if (!toast) return;
    if (toast.id === id) setToast(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Toast toast={toast} onClose={handleCloseToast} />
      <div className="card mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {community.name}
            </h1>
            <div className="flex flex-wrap gap-2 mb-4">
              {community.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-primary-500/20 text-primary-400 text-sm px-3 py-1 rounded-full border border-primary-500/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
          {joined ? (
            <button
              onClick={handleLeave}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Leave Community
            </button>
          ) : (
            <button
              onClick={handleJoin}
              className="btn-primary"
            >
              Join Community
            </button>
          )}
        </div>

        <p className="text-gray-300 mb-6">{community.description}</p>

        <div className="flex items-center space-x-6 text-sm text-gray-400">
          <span>{community.membersCount} members</span>
          <span className="capitalize">{community.visibility} community</span>
          {community.campus && <span>{community.campus}</span>}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Active Pods</h2>
        <Link
          to={`/create-pod/${id}`}
          className="btn-primary"
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
        <div className="text-center py-12 card">
          <p className="text-gray-300">No active pods. Be the first to create one!</p>
        </div>
      )}
    </div>
  );
}

// (No extra wrapper) 
