import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider.jsx";
import { useState, useEffect, useCallback } from "react";
import MainLayout from "../../components/main/MainLayout.jsx";
import ProtectedRoute from "../../utils/ProtectedRoute.jsx";
import mergeUniqueById from "../../utils/mergeUniqueById.js";
import axios from "axios";
import SearchCommunity from "../../components/communitiesLayouts/SearchCommunity.jsx";
import { useNavigate } from "@tanstack/react-router";
export const Route = createFileRoute("/communities/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Communities />
      </MainLayout>
    </ProtectedRoute>
  );
}

const Communities = () => {
  const query = Route.useSearch();
  const pageSize = 10;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { token } = useAuth();
  const navigate = useNavigate();
  const handleCommunityClick = (communityId) => {
    navigate({ to: `/communities/${communityId}` });
  };

  const searchCommunities = useCallback(
    async (query = "", start = 0, amount = 10) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/search/community?q=${encodeURIComponent(query)}&start=${start}&amount=${amount}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setError(null);
        const newData = response.status === 204 ? [] : response.data;
        if (newData.length < amount) {
          setHasMore(false);
        }
        setData((prev) => mergeUniqueById(prev, newData));
      } catch (err) {
        setError(err.response?.data || "Error searching communities");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );
  useEffect(() => {
    const isValidQuery = query.q !== '';
    if (isValidQuery) {
      setHasMore(true);
      setData([]);
      searchCommunities(query.q, data.length, pageSize);
    } else{
      setData([]);
      setHasMore(false);
      setError("Brak zapytania do wyszukania");
    }
  }, [query.q, token]);

  const handleLoadMore = () => {
    searchCommunities(query.q, data.length, pageSize);
  };
  if (error) {
    return <div>Error: {typeof error === 'string' ? error : error.title || "Something went wrong"}</div>;
  }
  return (
    <div>
      {loading && data.length === 0 && <p>Ładowanie...</p>}

      {data.map((community) => (
        <div className="community-card"
          key={community.id}
          onClick={() => handleCommunityClick(community.id)}
          style={{ cursor: "pointer" }}
          >
          <SearchCommunity community={community} />
        </div>
      ))}

      {!loading && data.length === 0 && (
        <div className="no-more-posts">Nie znaleziono</div>
      )}

      {data.length > 0 && (
        <div className="pagination">
          {hasMore ? (
            <button
              className="btn btn-primary"
              onClick={handleLoadMore}
              disabled={loading}
            >
              {loading ? "Ładowanie..." : "Załaduj więcej"}
            </button>
          ) : (
            <div className="no-more-posts">
              Nie ma już więcej społeczności do załadowania
            </div>
          )}
        </div>
      )}
    </div>
  );
};
