import React, { useState } from "react";
import axios from "axios";
import "./profile.scss";
import { useAuth } from "../../contexts/authProvider";
import { useNavigate } from "@tanstack/react-router";
import ImageCrop from "../modals/ImageCrop.jsx";

const Profile = ({ user }) => {
  const [activeModal, setActiveModal] = useState(null); // Track which modal is open
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [error, setError] = useState(null); // Handle API errors
  const [isLoading, setIsLoading] = useState(false); // Handle modal loading state
  const [isFollowLoading, setIsFollowLoading] = useState(false); // Handle follow button loading
  const [isFollowing, setIsFollowing] = useState(user.isFollowing); // Track follow state
  
  const { user: authUser, follow, setFollow, getProfilePictureUrl, updateProfilePicture} = useAuth();
  const navigate = useNavigate();
  const [showCropModal, setShowCropModal] = useState(false);
  const isMe = authUser.id === user.id;

  // Assume token is stored in localStorage or passed via context
  const token = localStorage.getItem("token") || "";
  console.log("Token:", follow);
  // Fetch followers
  const fetchFollowers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/${user.id}/fans`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFollowers(response.data);
      setActiveModal("followers");
      setError(null);
    } catch (err) {
      console.error("Error fetching followers:", err);
      setError("Nie udało się załadować obserwujących");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch following
  const fetchFollowing = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/${user.id}/follows`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFollowing(response.data);
      setActiveModal("following");
      setError(null);
    } catch (err) {
      console.error("Error fetching following:", err);
      setError("Nie udało się załadować obserwowanych");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch communities
  const fetchCommunities = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/${user.id}/communities`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommunities(response.data);
      setActiveModal("communities");
      setError(null);
    } catch (err) {
      console.error("Error fetching communities:", err);
      setError("Nie udało się załadować społeczności");
    } finally {
      setIsLoading(false);
    }
  };

  // Follow user
  const handleFollow = async () => {
    try {
      setIsFollowLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/follow/${user.id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 201) {
        setIsFollowing(true);
        setFollow((p) => [
          ...p,
          {
            id: user.id,
            userName: user.userName,
          },
        ]);
        setError(null);
      } else if (response.status === 200) {
        setError(response.data.message); // Already following
      }
    } catch (err) {
      console.error("Error following user:", err);
      setError(
        err.response?.data?.error || "Nie udało się zaobserwować użytkownika"
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Unfollow user
  const handleUnfollow = async () => {
    try {
      setIsFollowLoading(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/user/unfollow/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setIsFollowing(false);
        setFollow((p) => p.filter((author) => author.id !== user.id));
        setError(null);
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
      setError(
        err.response?.data?.error ||
          "Nie udało się przestać obserwować użytkownika"
      );
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setActiveModal(null);
  };

  if (!user) {
    console.log("No user data provided");
    return <div className="text-center mt-5">Loading...</div>;
  }
  const handleProfileClick = (e) => {
    e.stopPropagation();
    if (!isMe) return;
    setShowCropModal(true);
  };
  console.log("Rendering Profile component with user:", user);

  return (
    <div className="container mt-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
            <img
              className="rounded-circle me-3"
              src={getProfilePictureUrl()}
              alt={`${user.userName}'s avatar`}
              width={80}
              height={80}
              style={{
                objectFit: "cover",
                cursor: isMe ? "pointer" : "default",
              }}
              onClick={handleProfileClick}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/avatar.svg"; 
              }}
            />
            <div>
              <h2 className="card-title mb-1">{user.userName}</h2>
              <p className="text-muted mb-0">
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            {!isMe && (
              <button
                className={`btn ${follow.some((p) => p.id === user.id) ? "btn-secondary" : "btn-primary"} ms-auto`}
                onClick={
                  follow.some((p) => p.id === user.id)
                    ? handleUnfollow
                    : handleFollow
                }
                disabled={isFollowLoading}
              >
                {isFollowLoading
                  ? "Ładowanie..."
                  : follow.some((p) => p.id === user.id)
                    ? "Przestań obserwować"
                    : "Obserwuj"}
              </button>
            )}
          </div>

          <div className="d-flex gap-4 mb-3">
            <div
              className="cursor-pointer text-primary"
              onClick={fetchFollowers}
              role="button"
            >
              <strong>{user.followersCount}</strong> Obserwujących
            </div>
            <div
              className="cursor-pointer text-primary"
              onClick={fetchFollowing}
              role="button"
            >
              <strong>{follow.length}</strong> Obserwowanych
            </div>
            <div
              className="cursor-pointer text-primary"
              onClick={fetchCommunities}
              role="button"
            >
              <strong>{user.communitiesCount}</strong> Społeczności
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
        </div>
      </div>

      {/* Followers Modal */}
      {activeModal === "followers" && (
        <div
          className="modal"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closeModal}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Obserwujący</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {isLoading ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Ładowanie...</span>
                    </div>
                  </div>
                ) : followers.length > 0 ? (
                  <ul className="list-group">
                    {followers.map((follower) => (
                      <li
                        key={follower.id}
                        onClick={() =>
                          navigate({ to: `/users/${follower.id}` })
                        }
                        className="list-group-item cursor-pointer user-select-none"
                      >
                        {follower.userName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Brak obserwujących.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Following Modal */}
      {activeModal === "following" && (
        <div
          className="modal"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closeModal}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Obserwowani</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {isLoading ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Ładowanie...</span>
                    </div>
                  </div>
                ) : following.length > 0 ? (
                  <ul className="list-group">
                    {following.map((followed) => (
                      <li
                        key={followed.id}
                        onClick={() =>
                          navigate({ to: `/users/${followed.id}` })
                        }
                        className="list-group-item cursor-pointer user-select-none"
                      >
                        {followed.userName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Brak obserwowanych.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communities Modal */}
      {activeModal === "communities" && (
        <div
          className="modal"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closeModal}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Społeczności</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {isLoading ? (
                  <div className="text-center">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Ładowanie...</span>
                    </div>
                  </div>
                ) : communities.length > 0 ? (
                  <ul className="list-group">
                    {communities.map((community) => (
                      <li
                        key={community.id}
                        onClick={() =>
                          navigate({ to: `/communities/${community.id}` })
                        }
                        className="list-group-item cursor-pointer user-select-none"
                      >
                        {community.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Brak społeczności.</p>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCropModal && (
        <ImageCrop
          show={showCropModal}
          onClose={() => {
            setShowCropModal(false) ;
            updateProfilePicture(); // I know it forces reload on every close, but who cares???
          }}
          endPointUrl={`${import.meta.env.VITE_API_URL}/img/add/user`}
        />
      )}
    </div>
  );
};

export default Profile;
