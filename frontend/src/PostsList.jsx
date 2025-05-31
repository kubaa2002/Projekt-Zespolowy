import React, { useEffect, useState } from "react";
import { useAuth } from "./contexts/authProvider"; 
import axios from "axios";
import Post from "./components/post/Post";
import { usePosts } from "./contexts/PostsContext";

const PostsList = ({ showSort, setShowSort }) => {
  const { token } = useAuth();
  const {setPosts,posts} = usePosts(); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true); 
  const [sortOption, setSortOption] = useState("Najnowsze"); 


  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


  const fetchPosts = async (pageNum) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts?page=${pageNum}&pageSize=${pageSize}`,
        getAuthConfig()
      );
      const newPosts = response.data;
      setPosts((prev) => (pageNum === 1 ? newPosts : [...prev, ...newPosts]));

      setHasMore(newPosts.length === pageSize);
      setError(null);
    } catch (err) {
      setError(err.response?.data || "Error fetching posts");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPosts(1);
  }, []);


  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };


  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSort(false); 
  };


  const sortedPosts = [...posts]
    .filter((post) => post.parentId === null)
    .sort((a, b) => {
      if (sortOption === "Najnowsze") {
        return new Date(b.createdDateTime) - new Date(a.createdDateTime);
      } else if (sortOption === "Najbardziej lubiane") {
        return (b.likesCount || 0) - (a.likesCount || 0); 
      }
      return 0;
    });

  if (loading && page === 1) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="dropdown-sort">
        <button
          className="btn btn-secondary dropdown-toggle btn-sort"
          type="button"
          onClick={() => setShowSort((o) => !o)}
        >
          {sortOption}
        </button>
        <ul
          className="dropdown-menu dropdown-menu-custom"
          style={{
            display: showSort ? "block" : "none",
            position: "absolute",
          }}
        >
          <li className="dropdown-item dropdown-item-sort">Sortuj według</li>
          <li
            className="dropdown-item"
            onClick={() => handleSortChange("Najnowsze")}
          >
            Najnowsze
          </li>
          <li
            className="dropdown-item"
            onClick={() => handleSortChange("Najbardziej lubiane")}
          >
            Najbardziej lubiane
          </li>
        </ul>
      </div>
     
        {sortedPosts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
   
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
            Nie ma już więcej postów do załadowania
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsList;