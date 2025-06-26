import React, { useEffect, useState } from "react";
import api from "../../api";
import { useSelector } from "react-redux";
import Tweet from "../Tweet/Tweet";

const HashtagResults = ({ hashtag }) => {
  const [hashtagResults, setHashtagResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchHashtagResults = async () => {
      if (!hashtag || hashtag.trim() === '') {
        setHashtagResults([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await api.get(`/tweets/hashtag/${encodeURIComponent(hashtag)}`);
        setHashtagResults(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Hashtag search error:", err);
        setError("Failed to fetch hashtag results. Please try again.");
        setHashtagResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHashtagResults();
  }, [hashtag]);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="card mb-6">
          <h2 className="text-2xl font-extrabold text-orange-500 mb-4 text-center">
            #{hashtag}
          </h2>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading...</p>
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
            #{hashtag}
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
      {/* Hashtag Results Header */}
      <div className="card mb-6">
        <h2 className="text-2xl font-extrabold text-orange-500 mb-2 text-center">
          #{hashtag}
        </h2>
        <p className="text-gray-600 text-center mb-4">
          Posts tagged with #{hashtag}
        </p>
        {hashtagResults.length > 0 && (
          <p className="text-sm text-gray-500 text-center">
            Found {hashtagResults.length} post{hashtagResults.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Hashtag Results */}
      {hashtag && hashtagResults.length === 0 && !isLoading && (
        <div className="card text-center py-8">
          <p className="text-gray-500 text-lg mb-2">No posts found</p>
          <p className="text-gray-400 text-sm">
            No posts have been tagged with #{hashtag} yet
          </p>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-6">
        {hashtagResults.map((tweet) => (
          <div className="card" key={tweet._id}>
            <Tweet tweet={tweet} setData={setHashtagResults} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HashtagResults; 