import React from "react";
import "./profile.scss";

const Profile = ({ user }) => {
  if (!user) return null;

  return (
    <div className="profile-container">
      <img
        className="profile-avatar"
        src={user.avatarUrl || "/default-avatar.svg"}
        alt={`${user.username}'s avatar`}
        width={64}
        height={64}
      />
      <div className="profile-info">
        <h2 className="profile-username">{user.username}</h2>
        <p className="profile-email">{user.email}</p>
      </div>
    </div>
  );
};

export default Profile;
