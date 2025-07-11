import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import CommentBox from "./CommentBox";
import CommentCard from "./CommentCard";
import { useAuth } from "../../contexts/authProvider";
import CommentModal from "./CommentModal";
import Post from "./Post";
import BackButton from "./BackButton";

const Hidden = () => {
  const [comments, setComments] = useState([]);
  const [post, setPost] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const bottomRef = useRef(null);
  useEffect(() => {
    fetchPostComments(id);
  }, [id]);

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const fetchPostComments = async (parentId, page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/${parentId}/comments?page=${page}&pageSize=${pageSize}`,
        getAuthConfig()
      );
      const response2 = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/${parentId}`,
        getAuthConfig()
      );
      const comme = response.data;
      comme.forEach(obj => {
        obj.isDeleted = false;
      });
      const nnn = response2.data;
      nnn.isDeleted = false
      setPost(nnn);
      setComments(comme);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error fetching post comments");
      throw err;
    } finally {
      setLoading(false);
    }
  };


  if (!id) {
    return (
      <MainLayout>
        <h1>Error</h1>
        <p>Post ID is missing in the URL.</p>
      </MainLayout>
    );
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <BackButton />
      <Post post={post} showReplies={false} />
      <CommentBox id={id} comments={comments} setComments={setComments}  bottomRef={bottomRef} />
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          id={comment.id}
          authorId={comment.authorId}
          communityId={comment.communityId}
          authorName={comment.authorName || "Jakiś tam użytkownik"}
          createdDateTime={comment.createdDateTime}
          text={comment.content || "Lorem ipsum dolor sit amet..."}
          likes={comment.likes || []}
          dislikes={comment.dislikesCount || 0}
          isDisliked={comment.isDisliked || false}
          isLied={comment.isLied || false}
          replyCount={comment.commentCount || 0}
          post={comment}
        />
      ))}
      <div ref={bottomRef} className="h100"/>
    </div>
  );
};

export default Hidden;
