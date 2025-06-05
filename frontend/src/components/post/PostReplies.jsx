import React, { useState, useEffect } from 'react';
import './PostReplies.css';
import UserTag from './UserTag';
import axios from 'axios';
import { useAuth } from '../../contexts/authProvider';
import Like from './Like';
import Dislike from './Dislike';

const PostReplies = ({ posts }) => {
  const { token } = useAuth();

  const [reactions, setReactions] = useState(
    posts.reduce((acc, post) => ({
      ...acc,
      [post.id]: {
        isLiked: post.isLied || false, 
        isDisliked: post.isDisliked || false, 
        likesCount: post.likesCount || 0,
        dislikesCount: post.dislikesCount || 0,
      },
    }), {})
  );


  useEffect(() => {
    setReactions((prev) =>
      posts.reduce((acc, post) => ({
        ...acc,
        [post.id]: {
          isLiked: post.isLied || false,
          isDisliked: post.isDisliked || false,
          likesCount: post.likesCount || 0,
          dislikesCount: post.dislikesCount || 0,
        },
      }), prev)
    );
  }, [posts]);


  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


  const handleLike = async (postId) => {
    const current = reactions[postId] || { isLiked: false, isDisliked: false, likesCount: 0, dislikesCount: 0 };
    const reactionType = current.isLiked ? 3 : 1; 
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/Like`,
        { reactionType },
        getAuthConfig()
      );
      console.log('Reaction processed:', response.data);
      setReactions((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          isLiked: !current.isLiked,
          likesCount: reactionType === 1 ? current.likesCount + 1 : current.likesCount - 1,
          ...(current.isDisliked && reactionType === 1
            ? { isDisliked: false, dislikesCount: current.dislikesCount - 1 }
            : {}),
        },
      }));
    } catch (err) {
      console.error('Error processing reaction:', err.response?.data || err.message);
    }
  };

 
  const handleDislike = async (postId) => {
    const current = reactions[postId] || { isLiked: false, isDisliked: false, likesCount: 0, dislikesCount: 0 };
    const reactionType = current.isDisliked ? 3 : 2; 
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${postId}/Like`,
        { reactionType },
        getAuthConfig()
      );
      console.log('Reaction processed:', response.data);
      setReactions((prev) => ({
        ...prev,
        [postId]: {
          ...prev[postId],
          isDisliked: !current.isDisliked,
          dislikesCount: reactionType === 2 ? current.dislikesCount + 1 : current.dislikesCount - 1,
          ...(current.isLiked && reactionType === 2
            ? { isLiked: false, likesCount: current.likesCount - 1 }
            : {}),
        },
      }));
    } catch (err) {
      console.error('Error processing reaction:', err.response?.data || err.message);
    }
  };

  console.log("PostReplies component rendered with posts:", posts);

  return (
    <div className="post-container22">
      {posts.map((post) => (
        <div className="post-card2" key={post.id}>
          <UserTag post={post} />
          <div className="post-content">{post.content}</div>
          <hr />
          <div className="post-footer">
            <span>
            <Like isLiked={reactions[post.id]?.isLiked} likesCount={reactions[post.id]?.likesCount ?? 0} handleLike={() => handleLike(post.id)} />
            
             
            </span>
            <span>
            <Dislike isDisliked={reactions[post.id]?.isDisliked} handleDislike={() => handleDislike(post.id)} dislikesCount={reactions[post.id]?.dislikesCount ?? 0} />
            
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostReplies;