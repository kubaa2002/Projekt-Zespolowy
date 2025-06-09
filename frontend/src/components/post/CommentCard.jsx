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

const CommentCard = ({ id, authorName, createdDateTime, text, replyCount, authorId, communityId, post: p1 }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const { token, user } = useAuth();
  const post = {  createdDateTime, authorId, id };

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

  // Handle like (with switch behavior)
  const handleLike = async () => {
    try {
      // If the post is disliked, remove the dislike first
      if (isDisliked) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${id}/unlike`,
          {
            appUserId: user.id,
            postId: id,
            reactionId: 2,
          },
          getAuthConfig()
        );
      }

      // If the post is not already liked, add a like
      if (!isLiked) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${id}/Like`,
          {
            appUserId: user.id,
            postId: id,
            reactionId: 1,
          },
          getAuthConfig()
        );
      } else {
        // If the post is already liked, remove the like
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${id}/unlike`,
          {
            appUserId: user.id,
            postId: id,
            reactionId: 1,
          },
          getAuthConfig()
        );
      }

      // Update the p1.likes array and state
      setIsLiked(!isLiked);
      setLikesCount((prev) => (!isLiked ? prev + 1 : prev - 1));
      if (isDisliked) {
        setIsDisliked(false);
        setDislikesCount((prev) => prev - 1);
      }

      // Update p1.likes
      p1.likes = isLiked
        ? p1.likes.filter(p => p.appUserId !== user.id || p.reactionId !== 1)
        : [...p1.likes.filter(p => p.appUserId !== user.id || p.reactionId !== 2), { appUserId: user.id, reactionId: 1 }];
    } catch (err) {
      console.error('Error processing like:', err.response?.data || err.message);
    }
  };

  // Handle dislike (with switch behavior)
  const handleDislike = async () => {
    try {
      // If the post is liked, remove the like first
      if (isLiked) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${id}/unlike`,
          {
            appUserId: user.id,
            postId: id,
            reactionId: 1,
          },
          getAuthConfig()
        );
      }

      // If the post is not already disliked, add a dislike
      if (!isDisliked) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${id}/Like`,
          {
            appUserId: user.id,
            postId: id,
            reactionId: 2,
          },
          getAuthConfig()
        );
      } else {
        // If the post is already disliked, remove the dislike
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${id}/unlike`,
          {
            appUserId: user.id,
            postId: id,
            reactionId: 2,
          },
          getAuthConfig()
        );
      }

      // Update the p1.likes array and state
      setIsDisliked(!isDisliked);
      setDislikesCount((prev) => (!isDisliked ? prev + 1 : prev - 1));
      if (isLiked) {
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
      }

      // Update p1.likes
      p1.likes = isDisliked
        ? p1.likes.filter(p => p.appUserId !== user.id || p.reactionId !== 2)
        : [...p1.likes.filter(p => p.appUserId !== user.id || p.reactionId !== 1), { appUserId: user.id, reactionId: 2 }];
    } catch (err) {
      console.error('Error processing dislike:', err.response?.data || err.message);
    }
  };

  // Sync state with props on rerender
  useEffect(() => {
    setIsLiked(p1.likes?.some(like => like.appUserId === user?.id && like.reactionId === 1) || false);
    setIsDisliked(p1.likes?.some(like => like.appUserId === user?.id && like.reactionId === 2) || false);
    setLikesCount(p1.likes?.filter(like => like.reactionId === 1).length || 0);
    setDislikesCount(p1.likes?.filter(like => like.reactionId === 2).length || 0);
  }, [p1.likes, user]);

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
          title: "Odpowiedź na komentarz",
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
          <UserTag post={p1} />

          <p className="comment-text">{text}</p>

          <div className="comment-footer">
            <div className="reactions">
              <Like
                isLiked={isLiked}
                likesCount={likesCount}
                handleLike={handleLike}
              />
              <Dislike
                isDisliked={isDisliked}
                dislikesCount={dislikesCount}
                handleDislike={handleDislike}
              />
            </div>
            <div className="actions">
              {(replyCount > 0 || comments.length > 0) && (
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