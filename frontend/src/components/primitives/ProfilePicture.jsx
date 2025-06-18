import React from "react";

export default function ProfilePicture({ src, alt, isMe, onClick }) {
  return (
    <div
      className="pfp-wrapper"
      onClick={onClick}
      style={{ cursor: isMe ? "pointer" : "default" }}
    >
      <img
        className="rounded-circle me-3"
        src={src}
        alt={alt}
        width={80}
        height={80}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = "/avatar.svg";
        }}
      />
      {isMe && (<div className="change-pfp">
        <i class="bi bi-camera"></i>
      </div>)}
      
    </div>
  );
}
