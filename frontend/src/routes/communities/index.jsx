import { createFileRoute } from '@tanstack/react-router'
import { useSearch } from '../../contexts/SearchContext.jsx'
import { useEffect } from 'react'
export const Route = createFileRoute('/communities/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Communities />
}

const Communities = () => {
  const query = Route.useSearch();
  console.log("Communities query:", query);
  const search = useSearch();
  const pageSize = 10;
  
  useEffect(() => {
    if (query.q !== undefined) {
      search.reset(); 
      search.searchCommunities(query.q, 0, pageSize);
    }
    return () => {
      search.reset();
    };
  }, [query.q]);

  const handleLoadMore = () => {
    search.searchCommunities(query["q"], search.data.length, pageSize);
  };

  return (
    <div>
      {search.loading && search.data.length === 0 && <p>Ładowanie...</p>}
  
      {search.data.map((community) => (
        <div key={community.id} className="community-card">
          <h2>{community.name}</h2>
          <p>{community.description}</p>
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
            <div className="no-more-posts">Nie ma już więcej społeczności do załadowania</div>
          )}
        </div>
      )}
    </div>
  );
}
