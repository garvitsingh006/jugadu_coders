import { Link } from 'react-router-dom';

export default function CommunityCard({ community }) {
  return (
    <Link to={`/community/${community._id}`}>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {community.name}
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {community.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        <p className="text-gray-600 text-sm mb-4">{community.description}</p>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>{community.membersCount ?? 0} members</span>
          <div className="flex items-center gap-2">
            <span className="capitalize">{community.visibility}</span>
            {community.isAdmin ? (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Admin</span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">Member</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
