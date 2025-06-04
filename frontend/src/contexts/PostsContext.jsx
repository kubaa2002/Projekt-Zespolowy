import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useAuth } from "./authProvider";

const PostsContext = createContext();

const PostsProvider = ({ children }) => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({});

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchPosts = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts?page=${page}&pageSize=${pageSize}`,
        getAuthConfig()
      );
      setPosts(response.data);
      console.log("pobiermam posty");
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error fetching posts");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityPosts = async (communityId, page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/community/${communityId}?page=${page}&pageSize=${pageSize}`,
        getAuthConfig()
      );
      setPosts(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error fetching community posts");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async (authorId, page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/user/${authorId}?page=${page}&pageSize=${pageSize}`,
        getAuthConfig()
      );
      setPosts(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error fetching user posts");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a post (GET /posts/{parentId}/comments)
  const fetchPostComments = async (parentId, page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/${parentId}/comments?page=${page}&pageSize=${pageSize}`,
        getAuthConfig()
      );
      setComments((prev) => ({
        ...prev,
        [parentId]: response.data, // Store comments for this post ID
      }));
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error fetching post comments");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch all posts (GET /posts/GetAll)
  const fetchAllPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/GetAll`,
        getAuthConfig()
      );
      setPosts(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error fetching all posts");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single post by ID (GET /posts/{id})
  const fetchPostById = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/${id}`,
        getAuthConfig()
      );
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error fetching post");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a new post (POST /posts)
  const createPost = async (postData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts`,
        postData,
        getAuthConfig()
      );
      setPosts((prev) => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error creating post");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a post in a community (POST /posts/community/{community_id})
  const createPostInCommunity = async (communityId, postData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/community/${communityId}`,
        postData,
        getAuthConfig()
      );
      setPosts((prev) => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error creating post in community");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create a comment on a post (POST /posts/{parent_id})
  const createComment = async (parentId, postData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${parentId}`,
        postData,
        getAuthConfig()
      );
      setPosts((prev) => [...prev, response.data]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error creating comment");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update a post (PUT /posts)
  const updatePost = async (postData) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/posts`,
        postData,
        getAuthConfig()
      );
      setPosts((prev) =>
        prev.map((post) => (post.Id === postData.Id ? postData : post))
      );
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error updating post");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete a post (PUT /posts/Delete/{id})
  const deletePost = async (id, postData) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/Delete/${id}`,
        postData,
        getAuthConfig()
      );
      setPosts((prev) => prev.filter((post) => post.Id !== id));
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error deleting post");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Undo delete a post (PUT /posts/UndoDelete/{id})
  const undoDeletePost = async (id, postData) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/posts/UndoDelete/${id}`,
        postData,
        getAuthConfig()
      );
      setPosts((prev) => [...prev, postData]);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error undoing post deletion");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <PostsContext.Provider
      value={{
        posts,
        loading,
        error,
        fetchPosts,
        fetchCommunityPosts,
        fetchUserPosts,
        fetchPostComments,
        fetchAllPosts,
        fetchPostById,
        createPost,
        createPostInCommunity,
        createComment,
        updatePost,
        setPosts,
        deletePost,
        undoDeletePost,
      }}
    >
      {children}
    </PostsContext.Provider>
  );
};

export default PostsProvider;

export const usePosts = () => {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
