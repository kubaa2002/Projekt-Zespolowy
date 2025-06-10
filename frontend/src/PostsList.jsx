import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "./contexts/authProvider"; 
import axios from "axios";
import Post from "./components/post/Post";
import { usePosts } from "./contexts/PostsContext";
import { Link, useLocation } from '@tanstack/react-router'

const PostsList = ({urlWithoutQueryParams, searchParams}) => {
  console.log(searchParams);
  const { token, setFollow, user } = useAuth();
  const {setPosts,posts} = usePosts(); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [sortOption, setSortOption] = useState("Najnowsze");
  const [showSort, setShowSort] = useState(false);
  const observer = useRef(); 
  const location = useLocation();
  const lastPostElementRef = useCallback(
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

  const fetchPosts = async (pageNum) => {
    setLoading(true);
    try {
      const response = await axios.get(urlWithoutQueryParams, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ...(searchParams ? { q: searchParams } : {}),
          page: pageNum,
          pageSize: pageSize,
        },
      });
      const newPosts = response.data;
      if(Array.isArray(newPosts)){
        newPosts.forEach(obj => {
          obj.isDeleted = false;
        });
      }
      console.log("Fetched posts:", newPosts);
      setPosts((prev) => (pageNum === 1 ? newPosts : [...prev, ...newPosts]));
      setHasMore(newPosts.length === pageSize);
      setError(null);
    } catch (err) {
      console.log(err);
      setError(err.response?.data || "Error fetching posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1); 
  }, []);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page); 
    }
  }, [page]);

  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSort(false);
    setPage(1); 
    setPosts([]); 
    fetchPosts(1); 
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
       {searchParams && <Link to={location.pathname}>Wszytkie posty</Link>}
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

      {sortedPosts.map((post, index) => {
        if (index === sortedPosts.length - 1) {
          return (
            <div key={post.id} ref={lastPostElementRef}>
              <Post post={post} />
            </div>
          );
        }
        return <Post key={post.id} post={post} />;
      })}

      {loading && page > 1 && <div>Ładowanie...</div>}
      {!hasMore && sortedPosts.length > 0 && (
        <div className="no-more-posts">
          Nie ma już więcej postów do załadowania
        </div>
      )}
    </div>
  );
};

export default PostsList;