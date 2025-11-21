import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function PodCard({ pod }) {
  const timeLeft = formatDistanceToNow(new Date(pod.expiresAt), { addSuffix: true });

  return (
    <Link to={`/pod/${pod._id}`}>
      <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-2">
          <h4 className="font-semibold text-gray-800">
            {pod.title || `${pod.type} Pod`}
          </h4>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
            Active
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          {pod.communityId?.name || 'Community'}
        </p>
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>{pod.members.length} members</span>
          <span>Expires {timeLeft}</span>
        </div>
      </div>
    </Link>
  );
}
