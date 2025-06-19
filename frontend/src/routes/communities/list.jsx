import { createFileRoute, useNavigate } from '@tanstack/react-router';
import ProtectedRoute from '../../utils/ProtectedRoute.jsx';
import MainLayout from '../../components/main/MainLayout.jsx';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/authProvider.jsx';
import axios from 'axios';
import mergeUniqueById from '../../utils/mergeUniqueById.js';
import SearchCommunity from '../../components/communitiesLayouts/searchCommunity.jsx';

export const Route = createFileRoute('/communities/list')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Communities2 />
      </MainLayout>
    </ProtectedRoute>
  );
}

const Communities2 = () => {
  const pageSize = 10;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { token } = useAuth();
  const navigate = useNavigate();
  const observer = useRef();

  const handleCommunityClick = (communityId) => {
    navigate({ to: `/communities/${communityId}` });
  };

  const lastCommunityElementRef = useCallback(
    (node) => {
      if (loading || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  const searchCommunities = useCallback(
    async (start = 0, amount = pageSize) => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/search/communities?start=${start}&amount=${amount}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Response from search communities:', response.data);
        setError(null);
        const newData = response.status === 204 ? [] : response.data;
        if (newData.length < amount) {
          setHasMore(false);
        }
        setData((prev) => mergeUniqueById(prev, newData));
      } catch (err) {
        setError(err.response?.data || 'Error searching communities');
        console.error('Error searching communities:', err);
      } finally {
        setLoading(false);
      }
    },
    [token, pageSize]
  );

  useEffect(() => {
    setHasMore(true);
    setData([]);
    setPage(1);
    searchCommunities(0, pageSize);
  }, [token, searchCommunities]);

  useEffect(() => {
    if (page > 1) {
      searchCommunities((page - 1) * pageSize, pageSize);
    }
  }, [page, searchCommunities]);

  if (error) {
    return <div>Error: {typeof error === 'string' ? error : error.title || 'Something went wrong'}</div>;
  }

  return (
    <div>
      {loading && data.length === 0 && <p>Ładowanie...</p>}

      {data.map((community, index) => (
        <div
          className="community-card"
          key={community.id}
          ref={index === data.length - 1 ? lastCommunityElementRef : null}
          onClick={() => handleCommunityClick(community.id)}
          style={{ cursor: 'pointer' }}
        >
          <SearchCommunity community={community} />
        </div>
      ))}

      {loading && page > 1 && <p>Ładowanie...</p>}

      {!loading && data.length === 0 && <div className="no-more-posts">Nie znaleziono</div>}

      {!hasMore && data.length > 0 && (
        <div className="no-more-posts">Nie ma już więcej społeczności do załadowania</div>
      )}
    </div>
  );
};

export default Communities2;