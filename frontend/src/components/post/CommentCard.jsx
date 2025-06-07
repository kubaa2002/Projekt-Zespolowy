import React, { useState, useEffect } from "react";
import "./CommentCard.scss";
import { FaThumbsUp, FaThumbsDown, FaEllipsisV } from "react-icons/fa";
import PostReplies from "./PostReplies";
import CommentModal from "./CommentModal";
import { useAuth } from '../../contexts/authProvider';
import axios from "axios";
import UserTag from "./UserTag";
import Like from "./Like";
import Dislike from "./Dislike";

const CommentCard = ({ id, authorName, createdDateTime, text, likes, dislikes, isLied, isDisliked: isDislikedProp, replyCount,authorId,communityId }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(isLied); // Initialize with isLied
  const [isDisliked, setIsDisliked] = useState(isDislikedProp); // Initialize with isDislikedProp
  const [likesCount, setLikesCount] = useState(likes); // Track likes count
  const [dislikesCount, setDislikesCount] = useState(dislikes); // Track dislikes count
  const { token,user } = useAuth();
  const post = { authorName, createdDateTime,authorId,id };

  // Function to get auth headers
  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch comments for the post
  const fetchPostComments = async (parentId, page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/posts/${parentId}/comments?page=${page}&pageSize=${pageSize}`,
        getAuthConfig()
      );
      setComments(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || 'Error fetching post comments');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Handle like/unlike
  const handleLike = async () => {
    const reactionType = isLiked ? 3 : 1; // 3 to remove like, 1 to add like
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${id}/Like`,
        { reactionType },
        getAuthConfig()
      );
      console.log('Reaction processed:', response.data);
      setIsLiked(!isLiked); // Toggle like state
      setLikesCount((prev) => (reactionType === 1 ? prev + 1 : prev - 1)); // Update likes count
      if (isDisliked && reactionType === 1) {
        setIsDisliked(false); // Remove dislike if liking
        setDislikesCount((prev) => prev - 1); // Decrement dislikes count
      }
    } catch (err) {
      console.error('Error processing reaction:', err.response?.data || err.message);
    }
  };

  // Handle dislike/undislike
  const handleDislike = async () => {
    const reactionType = isDisliked ? 3 : 2; // 3 to remove dislike, 2 to add dislike
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${id}/Like`,
        { reactionType },
        getAuthConfig()
      );
      console.log('Reaction processed:', response.data);
      setIsDisliked(!isDisliked); // Toggle dislike state
      setDislikesCount((prev) => (reactionType === 2 ? prev + 1 : prev - 1)); // Update dislikes count
      if (isLiked && reactionType === 2) {
        setIsLiked(false); // Remove like if disliking
        setLikesCount((prev) => prev - 1); // Decrement likes count
      }
    } catch (err) {
      console.error('Error processing reaction:', err.response?.data || err.message);
    }
  };

  // Sync state with props on rerender
  useEffect(() => {
    setIsLiked(isLied);
    setIsDisliked(isDislikedProp);
    setLikesCount(likes);
    setDislikesCount(dislikes);
  }, [isLied, isDislikedProp, likes, dislikes]);

  useEffect(() => {
    if (showReplies) {
      fetchPostComments(id);
    }
  }, [id, showReplies]);

  // Open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle reply submission
  const handleReplySubmit = async (commentId, replyText) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${commentId}`,
        {
          id: 0,
          authorId: user.id,
          content: replyText.trim(),
          communityId: communityId,
          createdDateTime: new Date().toISOString(),
          parentId: id,
          isDeleted: false,
        },
        getAuthConfig()
      );
      await fetchPostComments(id);
      closeModal();
    } catch (err) {
      console.error('Error submitting reply:', err.response?.data || err.message);
    }
  };

  return (
    <div>
      <div className="comment-card2">
        <div className="box">
          <UserTag post={post} />

          <p className="comment-text">{text}</p>

          <div className="comment-footer">
            <div className="reactions">
              <Like isLiked={isLiked} likesCount={likesCount} handleLike={handleLike} />
              <Dislike isDisliked={isDisliked} handleDislike={handleDislike} dislikesCount={dislikesCount} />
              
            </div>
            <div className="actions">
              {(replyCount > 0 || comments.length >0 )&& (
                <label
                className="replies"
                onClick={() => setShowReplies((p) => !p)}
              >
                Pokaż wszystkie odpowiedzi ({Math.max(replyCount, comments.length)})
              </label>

              )}
              
              <label className="reply" onClick={openModal}>
                Odpowiedz
              </label>
            </div>
          </div>
        </div>
        {showReplies && <PostReplies posts={comments} />}
      </div>

      {isModalOpen && (
        <CommentModal
          onClose={closeModal}
          commentId={id}
          onSubmit={handleReplySubmit}
        />
      )}
    </div>
  );
};

export default CommentCard;