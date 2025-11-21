import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ChatBox from '../components/ChatBox';
import { formatDistanceToNow } from 'date-fns';

export default function PodLiveRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [pod, setPod] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPod();
  }, [id]);

  useEffect(() => {
    if (socket && pod) {
      socket.emit('join-pod', { podId: id });

      socket.on('pod-message', (message) => {
        setMessages((prev) => [...prev, message]);
      });

      socket.on('user-joined', ({ userId }) => {
        console.log('User joined:', userId);
      });

      socket.on('user-left', ({ userId }) => {
        console.log('User left:', userId);
      });

      return () => {
        socket.emit('leave-pod', { podId: id });
        socket.off('pod-message');
        socket.off('user-joined');
        socket.off('user-left');
      };
    }
  }, [socket, pod, id]);

  const fetchPod = async () => {
    try {
      const response = await api.get(`/pod/${id}`);
      setPod(response.data.pod);
      setMessages(response.data.pod.chat || []);
    } catch (error) {
      console.error('Fetch pod error:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (message) => {
    if (socket) {
      socket.emit('pod-message', { podId: id, message });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!pod || !pod.active) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white">Pod not available</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-green-400 hover:text-green-300"
        >
          Go back
        </button>
      </div>
    );
  }

  const timeLeft = formatDistanceToNow(new Date(pod.expiresAt), { addSuffix: true });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="card h-[600px] flex flex-col">
            <div className="bg-green-600 text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold">
                {pod.title || `${pod.type} Pod`}
              </h2>
              <p className="text-sm text-green-100">
                Expires {timeLeft}
              </p>
            </div>
            <ChatBox
              messages={messages}
              onSendMessage={handleSendMessage}
              currentUserId={user?._id}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Members ({pod.members.length})
            </h3>
            <div className="space-y-3">
              {pod.members.map((member) => (
                <div key={member._id} className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
                    <span className="text-green-400 font-semibold">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-gray-300">{member.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 mt-4">
            <h3 className="text-lg font-semibold text-white mb-4">
              Pod Info
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p><strong>Type:</strong> {pod.type}</p>
              <p><strong>Created:</strong> {formatDistanceToNow(new Date(pod.createdAt), { addSuffix: true })}</p>
              <p><strong>Community:</strong> {pod.communityId?.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
