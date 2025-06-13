import React, { useState } from "react";
import axios from "axios";
import "./CommentBox.scss";
import { useAuth } from "../../contexts/authProvider"; 

const CommentBox = ({ id, comments, setComments }) => {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const { token,user } = useAuth(); 


  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


  const handlePublish = async () => {
    if (!comment.trim()) {
      setError("Uzupełnij treść komentarza.");
      return;
    }

    const postData = {
      id: 0, 
      authorId: user.id,
      content: comment.trim(),
      communityId: null,
      title: "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
      createdDateTime: new Date().toISOString(),
      parentId: id,
      isDeleted: false,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${id}`,
        postData,
        getAuthConfig()
      );
      console.log("Komentarz dodany:", response.data);
      setComments((prevComments) => [...prevComments, response.data]); 
      setComment(""); 
      setError(""); 
    } catch (err) {
      location.reload();
      //console.error("Błąd podczas publikacji komentarza:", err);
      //setError(err.response?.data || "Błąd podczas publikacji komentarza");
    }
  };

  return (
    <div className="comment-container">
      <textarea
        className="form-control"
        maxLength={100}
        placeholder="Dodaj coś od siebie..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="chars">
        <span className="char-count user-select-none">{comment.length} / 100</span>
      </div>
      {error && <span className="text-danger err user-select-none">{error}</span>}
      <div className="comment-footer2">
        
        <button className="btn btn-primary btn-publish" onClick={handlePublish}>
          Dodaj komentarz
        </button>
      </div>
    </div>
  );
};

export default CommentBox;