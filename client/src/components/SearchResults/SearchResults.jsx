import React, { useEffect, useState } from "react";
import api from "../../api";
import { useSelector } from "react-redux";
import Tweet from "../Tweet/Tweet";

const SearchResults = ({ searchQuery }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery || searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(`/tweets/search?query=${encodeURIComponent(searchQuery)}`);
        setSearchResults(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Search error:", err);
        setError("Failed to perform search. Please try again.");
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to avoid too many requests while typing
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="card mb-6">
          <h2 className="text-2xl font-extrabold text-orange-500 mb-4 text-center">
            Search Results
          </h2>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Searching...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="card mb-6">
          <h2 className="text-2xl font-extrabold text-orange-500 mb-4 text-center">
            Search Results
          </h2>
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search Results Header */}
      <div className="card mb-6">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-2 text-center">
          Search Results
        </h2>
        <p className="text-gray-600 text-center mb-4">
          {searchQuery ? `Results for "${searchQuery}"` : "Enter a search term"}
        </p>
        {searchResults.length > 0 && (
          <p className="text-sm text-gray-500 text-center">
            Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Search Results */}
      {searchQuery && searchResults.length === 0 && !isLoading && (
        <div className="card text-center py-8">
          <p className="text-gray-500 text-lg mb-2">No results found</p>
          <p className="text-gray-400 text-sm">
            Try searching for different keywords or check your spelling
          </p>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-6">
        {searchResults.map((tweet) => (
          <div className="card" key={tweet._id}>
            <Tweet tweet={tweet} setData={setSearchResults} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults; 