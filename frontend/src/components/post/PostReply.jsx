
import UserTag from './UserTag';
import Like from './Like';
import Dislike from './Dislike';
import { useState } from 'react';
import { useAuth } from '../../contexts/authProvider'
import CommentModal from "./CommentModal";;
import axios from 'axios';
import PostReplies from './PostReplies';
const PostReply = ({ post, reactions, handleLike, handleDislike }) => {

      const [isModalOpen, setIsModalOpen] = useState(false);
    const { user, token } = useAuth();
    const { id, communityId } = post;

    const [showReplies, setShowReplies] = useState(false);
    const [replyCount, setReplyCount] = useState(post.commentCount || 0);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const openModal = () => {
      setIsModalOpen(true);
    };

    const closeModal = () => {
      setIsModalOpen(false);
    };

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
      setShowReplies(true);
    } catch (err) {
      console.error('Error submitting reply:', err.response?.data || err.message);
    }
  };

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

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const handleOpenReplies = async () => {
    if (!showReplies && comments.length === 0) { 
        try {
            const fetchedComments = await fetchPostComments(id);
            setComments(fetchedComments);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
        }
    setShowReplies((prev) => !prev);
  };

  return (
    <>
    <div className="post-card2" key={post.id}>
      <UserTag post={post} />
      <div className="post-content">{post.content}</div>

      <div className="comment-footer user-select-none">
            <div className="post-footer">
              <Like
          isLiked={reactions[post.id]?.isLiked}
          likesCount={reactions[post.id]?.likesCount ?? 0}
          handleLike={() => handleLike(post.id)}
        />
        <Dislike
          isDisliked={reactions[post.id]?.isDisliked}
          dislikesCount={reactions[post.id]?.dislikesCount ?? 0}
          handleDislike={() => handleDislike(post.id)}
        />
            </div>
            <div className="actions">
              {(replyCount > 0 || comments.length > 0) && (
                <label
                  className="replies"
                  onClick={handleOpenReplies}
                >
                  {showReplies ? 'Ukryj wszystkie odpowiedzi' : 'Pokaż wszystkie odpowiedzi'} ({Math.max(replyCount, comments.length)})
                </label>
              )}
              <label className="reply" onClick={openModal}>
                Odpowiedz
              </label>
            </div>
          </div>
          
          {isModalOpen && (
        <CommentModal
          onClose={closeModal}
          commentId={post.id}
          onSubmit={handleReplySubmit}
        />
      )}
    </div>
    {showReplies && <PostReplies posts={comments} line={true}/>}
    </>
  );
};

export default PostReply;