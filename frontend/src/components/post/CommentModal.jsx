import React, { useState } from 'react';
import './CommentModal.css';
import { RxCross2 } from 'react-icons/rx';

const CommentModal = ({ onClose, commentId, onSubmit }) => {
  const [text, setText] = useState('');
  const maxChars = 500;

  const  handleSubmit = async () => {
    if (text.trim()) {
      await onSubmit(commentId, text); 
      setText(''); 
      onClose(); 
    }
  };



  return (
    <div className="modal-overlay2">
      <div className="modal2">
        <div className="modal-header2">
          <h2>Odpowiedz na komentarz</h2>
          <button className="close-btn2" onClick={onClose}>
            <RxCross2 size={20} />
          </button>
        </div>
        <textarea
          className="form-control"
          placeholder="Napisz swoją odpowiedź..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={maxChars}
        />
        <div className="modal-footer2">
          <span className="char-count2">{text.length}/{maxChars}</span>
          <div className="modal-buttons2">
            <button className="cancel-btn2" onClick={onClose}>
              Zamknij
            </button>
            <button
              className="reply-btn2"
              disabled={!text.trim()}
              onClick={handleSubmit}
            >
              Odpowiedz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;