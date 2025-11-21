import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import { useGeolocation } from '../hooks/useGeolocation';

export default function Search() {
  const navigate = useNavigate();
  const { location } = useGeolocation();
  const [mode, setMode] = useState('global');

  const handleSearch = (query) => {
    navigate('/search-result', { 
      state: { query, mode, userLocation: location }
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Find Your Community
        </h1>
        <p className="text-lg text-gray-600">
          Search for communities that match your interests
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setMode('global')}
            className={`px-6 py-2 rounded-lg font-medium ${
              mode === 'global'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Global
          </button>
          <button
            onClick={() => setMode('local')}
            className={`px-6 py-2 rounded-lg font-medium ${
              mode === 'local'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Local
          </button>
        </div>
        <SearchBar onSearch={handleSearch} />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
        <ul className="text-blue-800 space-y-2">
          <li>• Search for communities by keywords, interests, or topics</li>
          <li>• Switch between Global (all communities) and Local (nearby) modes</li>
          <li>• AI will find the best matches or suggest creating a new community</li>
          <li>• Join communities and create live activity pods</li>
        </ul>
      </div>
    </div>
  );
}
