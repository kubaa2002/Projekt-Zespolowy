import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import ProtectedRoute from "../../utils/ProtectedRoute";
import { useState, useCallback, useEffect } from "react";
import mergeUniqueById from "../../utils/mergeUniqueById.js";
import MainLayout from "../../components/main/MainLayout.jsx";
import axios from "axios";
import { useAuth } from "../../contexts/authProvider.jsx";
import SearchProfile from "../../components/profilesLayouts/SearchProfile.jsx";
export const Route = createFileRoute("/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Users />
      </MainLayout>
    </ProtectedRoute>
  );
}

const Users = () => {
  const query = Route.useSearch();
  const navigate = useNavigate(); 
  const pageSize = 10;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { token } = useAuth();

  const handleProfileClick = (userId) => {
    navigate({ to: `/users/${userId}` });
  };

  const searchUsers = useCallback(
    async (query = "", start = 0, amount = 10) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/search/user?q=${encodeURIComponent(query)}&start=${start}&amount=${amount}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setError(null);
        const newData = response.data;
        if (newData.length < amount) {
          setHasMore(false);
        }
        setData((prev) => mergeUniqueById(prev, newData));
      } catch (err) {
        setError(err.response?.data || "Error searching users");
      } finally {
        setLoading(false);
      }
    },
    []
  );
  useEffect(() => {
    if (query.q !== undefined) {
      setHasMore(true);
      setData([]);
      searchUsers(query.q, 0, pageSize);
    }
  }, [query.q]);

  const handleLoadMore = () => {
    searchUsers(query.q, data.length, pageSize);
  };
  if (error) return <div>Error: {error}</div>;
  return (
    <>
      {loading && data.length === 0 && <p>Ładowanie...</p>}

      {data.map((user) => (
        <div className="profile-card"
          key={user.id}
          onClick={() => handleProfileClick(user.id)}
          style={{ cursor: "pointer" }}
        >
          <SearchProfile user={user} />
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
              Nie ma już więcej użytkowników do załadowania
            </div>
          )}
        </div>
      )}
    </>
  );
};
