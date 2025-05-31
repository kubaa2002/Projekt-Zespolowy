import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentBox from './CommentBox';
import CommentCard from './CommentCard';
import { useAuth } from '../../contexts/authProvider'; 
import CommentModal from './CommentModal';

const Hidden = ({ id }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth(); 


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
      setComments(response.data); 
      setError(null);
      console.log("Fetched comments:", response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data || 'Error fetching post comments');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostComments(id); 
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <CommentBox id={id}  comments={comments} setComments={setComments}/>
      {comments.map((comment) => (
        
        <CommentCard
          key={comment.id}
          id={comment.id}
          authorName={comment.authorName || 'Jakiś tam użytkownik'}
          createdDateTime={comment.createdDateTime}
          text={comment.content || 'Lorem ipsum dolor sit amet...'}
          likes={comment.likesCount || 0}
          dislikes={comment.dislikesCount || 0}
          isDisliked={comment.isDisliked || false}
          isLied={comment.isLied || false}
          replyCount={comment.replyCount || 0}
        />
      ))}
    
    </div>
  );
};

export default Hidden;