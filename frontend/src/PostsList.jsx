import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "./contexts/authProvider"; 
import axios from "axios";
import Post from "./components/post/Post";
import { usePosts } from "./contexts/PostsContext";
import { Link, useLocation } from '@tanstack/react-router'

const PostsList = ({urlWithoutQueryParams, searchParams, observedCanBeDisplayed=true}) => {
  const { token, setFollow, user } = useAuth();
  const {setPosts,posts} = usePosts(); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [sortOption, setSortOption] = useState("new");
  const [showSort, setShowSort] = useState(false);
  const observer = useRef(); 
  const location = useLocation();
   const menuRef = useRef();

  const p = {
    "new": "Nowe",
    "popular": "Popularne",
    "observed": "Obserwowane"
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowSort(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
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
          filter: sortOption,
        },
      });
      const newPosts = response.data;
      if(Array.isArray(newPosts)){
        newPosts.forEach(obj => {
          obj.isDeleted = false;
        });
      }
 
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
  }, [sortOption]);

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page); 
    }
  }, [page, sortOption]);

  const handleSortChange = (option) => {
    setSortOption(option);
    setShowSort(false);
    setPage(1); 
    setPosts([]); 
    fetchPosts(1); 
  };

  const sortedPosts = [...posts]

  if (loading && page === 1) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <div className="dropdown-sort user-select-none" ref={menuRef}>
        <button
          className="btn btn-secondary dropdown-toggle btn-sort"
          type="button"
          onClick={() => setShowSort((o) => !o)}
        >
          {p[sortOption] || "Sortuj"}
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
            onClick={() => handleSortChange("new")}
          >
            Nowe
          </li>
          <li
            className="dropdown-item"
            onClick={() => handleSortChange("popular")}
          >
            Popularne
          </li>
          {observedCanBeDisplayed  && (
            <li
              className="dropdown-item"
              onClick={() => handleSortChange("observed")}
            >
              Obserwowane
            </li>
          )}
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