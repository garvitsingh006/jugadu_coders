import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import CommunityCard from '../components/CommunityCard';

export default function SearchResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { query, mode, userLocation } = location.state || {};
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingCommunity, setCreatingCommunity] = useState(false);

  useEffect(() => {
    if (!query) {
      navigate('/search');
      return;
    }
    performSearch();
  }, [query, mode]);

  const performSearch = async () => {
    try {
      const response = await api.post('/community/search', {
        query,
        mode,
        userLocation
      });
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!results?.suggestion) return;

    setCreatingCommunity(true);
    try {
      const response = await api.post('/community/create', {
        name: results.suggestion.name,
        tags: results.suggestion.tags,
        description: results.suggestion.description,
        visibility: mode,
        location: userLocation ? {
          type: 'Point',
          coordinates: [userLocation.lng, userLocation.lat]
        } : undefined
      });

      navigate(`/community/${response.data.community._id}`);
    } catch (error) {
      console.error('Create community error:', error);
      alert('Failed to create community');
    } finally {
      setCreatingCommunity(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Searching...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Search Results for "{query}"
      </h1>

      {results?.found ? (
        <div>
          <p className="text-gray-600 mb-6">
            Found {results.communities.length} matching communities
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.communities.map((community) => (
              <CommunityCard key={community._id} community={community} />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">
              No exact matches found
            </h3>
            <p className="text-yellow-800">
              We couldn't find a perfect match, but here are some similar communities:
            </p>
          </div>

          {results?.communities && results.communities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {results.communities.map((community) => (
                <CommunityCard key={community._id} community={community} />
              ))}
            </div>
          )}

          {results?.suggestion && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-indigo-900 mb-4">
                AI Suggestion: Create a New Community
              </h3>
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {results.suggestion.name}
                </h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {results.suggestion.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <p className="text-gray-700">{results.suggestion.description}</p>
              </div>
              <button
                onClick={handleCreateCommunity}
                disabled={creatingCommunity}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {creatingCommunity ? 'Creating...' : 'Create This Community'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
