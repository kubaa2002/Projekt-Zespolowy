import { useState } from "react";
import "./Post.scss";

import UserTag from "./UserTag";
import axios from "axios";
import { useAuth } from "../../contexts/authProvider";
import { useNavigate } from "@tanstack/react-router";
import CommuityTag from "./CommuityTag";

const Post = ({ post, showReplies = true }) => {
  const { token, postIds, setPostIds, user } = useAuth();
  const { id, authorId, content, createdDateTime, isLied, likesCount,likes, commentCount } = post;
  const [liked, setLiked] = useState(likes.some(like => like.appUserId === user.id));
 
  const navigate = useNavigate();

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const handleLike = async () => {
    const reactionType = liked ? 3 : 1;
    try {
      if (!liked) {
        const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${id}/Like`,
        {
          appUserId: user.id,
          reactionName: "Like",
          postId: id,

          reactionId: reactionType,
        },
        getAuthConfig()
      );
      } else {
        const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/posts/${id}/unlike`,
        {
          appUserId: user.id,
          reactionName: "Like",
          postId: id,

          reactionId: reactionType,
        },
        getAuthConfig()
      );
      }
      
      setLiked(!liked);
      post.likes = liked ? post.likes.filter(p => p.appUserId !== user.id) : [...post.likes, { appUserId: user.id, reactionId: reactionType }];
    } catch (err) {
      console.error("Error processing reaction:", err);
    }
  };

  const handleDeleteShare = async () => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/share/DeleteShare/${id}/${user.id}`,
        getAuthConfig()
      );

      if (response.status === 200) {
        console.log(
          `Usunięto udostępnienie posta ${id} przez użytkownika ${user.id}.`
        );
        setPostIds((prevPostIds) =>
          prevPostIds.filter((postId) => postId !== id)
        ); // Update postIds state
        return true; // Indicate success
      }
    } catch (err) {
      console.error(
        "Błąd podczas usuwania udostępnienia:",
        err.response?.data?.error || err.message
      );
      throw err; // Propagate error for further handling
    }
  };
  const handleSharePost = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/share/${id}/${user.id}`,
        {}, // Empty payload as endpoint doesn't require a body
        getAuthConfig()
      );

      if (response.status === 201) {
        const shareDetails = response.data;
        console.log(
          `Post ${id} udostępniony przez użytkownika ${user.id} o ${shareDetails.sharedAt}.`
        );
        setPostIds((prevPostIds) => [...prevPostIds, id]); // Update postIds state
        return shareDetails; // e.g., { postId: 1, userId: "u006", sharedAt: "2025-06-06T..." }
      }
    } catch (err) {
      console.error(
        "Błąd podczas udostępniania posta:",
        err.response?.data?.error || err.message
      );
      throw err; // Propagate error for further handling
    }
  };

  const isLong = false;
  const previewText = isLong ? content.slice(0, 300) + "..." : content;
  return (
    <div>
      <div className="post-container">
        {post?.communityId ? <CommuityTag post={post} /> :<UserTag post={post} />}

        <div className="post-content">
          <h2 className="post-title">{post.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: previewText }} />
          {isLong && (
            <a href="#" className="read-more">
              ...czytaj dalej
            </a>
          )}
        </div>

        <div className="post-actions">
          <div>
            <label className={`icon-checkbox user-select-none ${liked ? "active" : ""}`}>
              <input type="checkbox" checked={liked} onChange={handleLike} />
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="red"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.9999 4.12207L10.9244 3.01657C8.39995 0.421573 3.77095 1.31707 2.09995 4.57957C1.31545 6.11407 1.13845 8.32957 2.57095 11.1571C3.95095 13.8796 6.82195 17.1406 11.9999 20.6926C17.1779 17.1406 20.0474 13.8796 21.4289 11.1571C22.8614 8.32807 22.6859 6.11407 21.8999 4.57957C20.2289 1.31707 15.5999 0.420073 13.0754 3.01507L11.9999 4.12207ZM11.9999 22.5001C-10.9995 7.30207 4.91845 -4.55993 11.7359 1.71457C11.8259 1.79707 11.9144 1.88257 11.9999 1.97107C12.0846 1.88265 12.1726 1.79759 12.2639 1.71607C19.0799 -4.56293 34.9994 7.30057 11.9999 22.5001Z"
                  fill="red"
                />
              </svg>
              {likes.filter(like => like.reactionId === 1).length}
            </label>
            {showReplies && (
              <label
                onClick={() => navigate({ to: `/post?id=${id}` })}
                className="icon-checkbox user-select-none"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.017 17.841C4.1727 17.9973 4.292 18.186 4.36641 18.3937C4.44082 18.6014 4.46851 18.8229 4.4475 19.0425C4.34208 20.0589 4.14221 21.0632 3.8505 22.0425C5.943 21.558 7.221 20.997 7.8015 20.703C8.13076 20.5362 8.50993 20.4967 8.8665 20.592C9.88865 20.8645 10.9421 21.0017 12 21C17.994 21 22.5 16.7895 22.5 12C22.5 7.212 17.994 3 12 3C6.006 3 1.5 7.212 1.5 12C1.5 14.202 2.4255 16.245 4.017 17.841ZM3.2775 23.6985C2.9221 23.769 2.56555 23.8335 2.208 23.892C1.908 23.94 1.68 23.628 1.7985 23.349C1.93169 23.0349 2.05376 22.7162 2.1645 22.3935L2.169 22.3785C2.541 21.2985 2.844 20.0565 2.955 18.9C1.1145 17.055 0 14.64 0 12C0 6.201 5.373 1.5 12 1.5C18.627 1.5 24 6.201 24 12C24 17.799 18.627 22.5 12 22.5C10.8115 22.5016 9.62788 22.3473 8.4795 22.041C7.6995 22.4355 6.021 23.154 3.2775 23.6985Z"
                    fill="black"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6 8.25C6 8.05109 6.07902 7.86032 6.21967 7.71967C6.36032 7.57902 6.55109 7.5 6.75 7.5H17.25C17.4489 7.5 17.6397 7.57902 17.7803 7.71967C17.921 7.86032 18 8.05109 18 8.25C18 8.44891 17.921 8.63968 17.7803 8.78033C17.6397 8.92098 17.4489 9 17.25 9H6.75C6.55109 9 6.36032 8.92098 6.21967 8.78033C6.07902 8.63968 6 8.44891 6 8.25ZM6 12C6 11.8011 6.07902 11.6103 6.21967 11.4697C6.36032 11.329 6.55109 11.25 6.75 11.25H17.25C17.4489 11.25 17.6397 11.329 17.7803 11.4697C17.921 11.6103 18 11.8011 18 12C18 12.1989 17.921 12.3897 17.7803 12.5303C17.6397 12.671 17.4489 12.75 17.25 12.75H6.75C6.55109 12.75 6.36032 12.671 6.21967 12.5303C6.07902 12.3897 6 12.1989 6 12ZM6 15.75C6 15.5511 6.07902 15.3603 6.21967 15.2197C6.36032 15.079 6.55109 15 6.75 15H12.75C12.9489 15 13.1397 15.079 13.2803 15.2197C13.421 15.3603 13.5 15.5511 13.5 15.75C13.5 15.9489 13.421 16.1397 13.2803 16.2803C13.1397 16.421 12.9489 16.5 12.75 16.5H6.75C6.55109 16.5 6.36032 16.421 6.21967 16.2803C6.07902 16.1397 6 15.9489 6 15.75Z"
                    fill="black"
                  />
                </svg>
                {commentCount > 0 ? commentCount: "Komentarze"}
              </label>
            )}
          </div>
          {!postIds.includes(id) ? (
            <span className="icon-checkbox user-select-none" onClick={handleSharePost}>
              <i className="bi bi-share-fill" />
              Share
            </span>
          ) : (
            <span className="icon-checkbox active user-select-none" onClick={handleDeleteShare}>
              <i className="bi bi-share-fill" />
              Shared
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
