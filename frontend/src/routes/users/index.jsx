import { createFileRoute } from '@tanstack/react-router'
import ProtectedRoute from '../../utils/ProtectedRoute'
import { useEffect } from 'react';
import { useSearch } from '../../contexts/SearchContext.jsx';
export const Route = createFileRoute('/users/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProtectedRoute><Users/></ProtectedRoute>
}

const Users = () => {
  const query = Route.useSearch();
  const search = useSearch();
  const pageSize = 10;
  
  useEffect(() => {
    if (query.q !== undefined) {
      search.reset(); 
      search.searchUsers(query.q, 0, pageSize);
    }
    return () => {
      search.reset();
    };
  }, [query.q]);

  const handleLoadMore = () => {
    search.searchUsers(query["q"], search.data.length, pageSize);
  };

  return (
    <div>
      {search.loading && search.data.length === 0 && <p>Ładowanie...</p>}
  
      {search.data.map((user) => (
        <div key={user.id} className="user-card">
          <h2>{user.nickname}</h2>
          <p>{user.email}</p>
        </div>
      ))}
  
      {!search.loading && search.data.length === 0 && (
        <div className="no-more-posts">Nie znaleziono</div>
      )}
  
      {search.data.length > 0 && (
        <div className="pagination">
          {search.hasMore ? (
            <button
              className="btn btn-primary"
              onClick={handleLoadMore}
              disabled={search.loading}
            >
              {search.loading ? "Ładowanie..." : "Załaduj więcej"}
            </button>
          ) : (
            <div className="no-more-posts">Nie ma już więcej użytkowników do załadowania</div>
          )}
        </div>
      )}
    </div>
  );
}