import React, { useState, useEffect } from 'react';
import './PostReplies.css';
import UserTag from './UserTag';
import axios from 'axios';
import { useAuth } from '../../contexts/authProvider';
import Like from './Like';
import Dislike from './Dislike';

const PostReplies = ({ posts }) => {
  const { token, user } = useAuth();

  // Initialize reactions state based on posts
  const [reactions, setReactions] = useState(
    posts.reduce((acc, post) => ({
      ...acc,
      [post.id]: {
        isLiked: post.likes?.some(like => like.appUserId === user?.id && like.reactionId === 1) || false,
        isDisliked: post.likes?.some(like => like.appUserId === user?.id && like.reactionId === 2) || false,
        likesCount: post.likes?.filter(like => like.reactionId === 1).length || 0,
        dislikesCount: post.likes?.filter(like => like.reactionId === 2).length || 0,
        likes: post.likes || [], // Store the likes array for each post
      },
    }), {})
  );

  // Sync reactions with updated posts
  useEffect(() => {
    setReactions((prev) =>
      posts.reduce((acc, post) => ({
        ...acc,
        [post.id]: {
          isLiked: post.likes?.some(like => like.appUserId === user?.id && like.reactionId === 1) || false,
          isDisliked: post.likes?.some(like => like.appUserId === user?.id && like.reactionId === 2) || false,
          likesCount: post.likes?.filter(like => like.reactionId === 1).length || 0,
          dislikesCount: post.likes?.filter(like => like.reactionId === 2).length || 0,
          likes: post.likes || [],
        },
      }), {})
    );
  }, [posts, user]);

  // Function to get auth headers
  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Handle like (with switch behavior)
  const handleLike = async (postId) => {
    const current = reactions[postId] || {
      isLiked: false,
      isDisliked: false,
      likesCount: 0,
      dislikesCount: 0,
      likes: [],
    };

    try {
      // If the post is disliked, remove the dislike first
      if (current.isDisliked) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${postId}/unlike`,
          {
            appUserId: user.id,
            postId,
            reactionId: 2,
          },
          getAuthConfig()
        );
      }

      // If the post is not already liked, add a like
      if (!current.isLiked) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${postId}/Like`,
          {
            appUserId: user.id,
            postId,
            reactionId: 1,
          },
          getAuthConfig()
        );
      } else {
        // If the post is already liked, remove the like
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${postId}/unlike`,
          {
            appUserId: user.id,
            postId,
            reactionId: 1,
          },
          getAuthConfig()
        );
      }

      // Update the state
      setReactions((prev) => {
        let updatedLikes = [...current.likes];

        // Remove dislike if present
        if (current.isDisliked) {
          updatedLikes = updatedLikes.filter(like => like.appUserId !== user.id || like.reactionId !== 2);
        }

        // Toggle like
        if (current.isLiked) {
          updatedLikes = updatedLikes.filter(like => like.appUserId !== user.id || like.reactionId !== 1);
        } else {
          updatedLikes = [...updatedLikes, { appUserId: user.id, reactionId: 1 }];
        }

        return {
          ...prev,
          [postId]: {
            ...prev[postId],
            isLiked: !current.isLiked,
            isDisliked: false, // Ensure dislike is removed
            likesCount: current.isLiked ? current.likesCount - 1 : current.likesCount + 1,
            dislikesCount: current.isDisliked ? current.dislikesCount - 1 : current.dislikesCount,
            likes: updatedLikes,
          },
        };
      });
    } catch (err) {
      console.error('Error processing like:', err.response?.data || err.message);
    }
  };

  // Handle dislike (with switch behavior)
  const handleDislike = async (postId) => {
    const current = reactions[postId] || {
      isLiked: false,
      isDisliked: false,
      likesCount: 0,
      dislikesCount: 0,
      likes: [],
    };

    try {
      // If the post is liked, remove the like first
      if (current.isLiked) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${postId}/unlike`,
          {
            appUserId: user.id,
            postId,
            reactionId: 1,
          },
          getAuthConfig()
        );
      }

      // If the post is not already disliked, add a dislike
      if (!current.isDisliked) {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${postId}/Like`,
          {
            appUserId: user.id,
            postId,
            reactionId: 2,
          },
          getAuthConfig()
        );
      } else {
        // If the post is already disliked, remove the dislike
        await axios.post(
          `${import.meta.env.VITE_API_URL}/posts/${postId}/unlike`,
          {
            appUserId: user.id,
            postId,
            reactionId: 2,
          },
          getAuthConfig()
        );
      }

      // Update the state
      setReactions((prev) => {
        let updatedLikes = [...current.likes];

        // Remove like if present
        if (current.isLiked) {
          updatedLikes = updatedLikes.filter(like => like.appUserId !== user.id || like.reactionId !== 1);
        }

        // Toggle dislike
        if (current.isDisliked) {
          updatedLikes = updatedLikes.filter(like => like.appUserId !== user.id || like.reactionId !== 2);
        } else {
          updatedLikes = [...updatedLikes, { appUserId: user.id, reactionId: 2 }];
        }

        return {
          ...prev,
          [postId]: {
            ...prev[postId],
            isDisliked: !current.isDisliked,
            isLiked: false, // Ensure like is removed
            dislikesCount: current.isDisliked ? current.dislikesCount - 1 : current.dislikesCount + 1,
            likesCount: current.isLiked ? current.likesCount - 1 : current.likesCount,
            likes: updatedLikes,
          },
        };
      });
    } catch (err) {
      console.error('Error processing dislike:', err.response?.data || err.message);
    }
  };

  return (
    <div className="post-container22">
      {posts.map((post) => (
        <div className="post-card2" key={post.id}>
          <UserTag post={post} />
          <div className="post-content">{post.content}</div>
          <hr />
          <div className="post-footer">
            <span>
              <Like
                isLiked={reactions[post.id]?.isLiked}
                likesCount={reactions[post.id]?.likesCount ?? 0}
                handleLike={() => handleLike(post.id)}
              />
            </span>
            <span>
              <Dislike
                isDisliked={reactions[post.id]?.isDisliked}
                dislikesCount={reactions[post.id]?.dislikesCount ?? 0}
                handleDislike={() => handleDislike(post.id)}
              />
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostReplies;