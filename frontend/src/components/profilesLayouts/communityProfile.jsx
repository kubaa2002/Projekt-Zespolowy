import React, { useState } from "react";
import axios from "axios";
import "./profile.scss";
import ImageCrop from "../modals/ImageCrop";

const CommunityProfile = ({ community, communityId }) => {
  const [isMember, setIsMember] = useState(community.isMember); // Track membership status
  const [isJoinLoading, setIsJoinLoading] = useState(false); // Handle join/leave button loading
  const [description, setDescription] = useState(community.description); // Track description
  const [editModalOpen, setEditModalOpen] = useState(false); // Track edit modal
  const [error, setError] = useState(null); // Handle API errors
  const isOwner = community.role === "owner";
  // Assume token is stored in localStorage
  const token = localStorage.getItem("token") || "";
  const [showCropModal, setShowCropModal] = useState(false);

  // Join community
  const handleJoin = async () => {
    try {
      setIsJoinLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/community/join/${communityId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsMember(true);
      setError(null);
    } catch (err) {
      console.error("Error joining community:", err);
      setError(
        err.response?.data?.error || "Nie udało się dołączyć do społeczności"
      );
    } finally {
      setIsJoinLoading(false);
    }
  };

  // Leave community
  const handleLeave = async () => {
    try {
      setIsJoinLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/community/left/${communityId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsMember(false);
      setError(null);
    } catch (err) {
      console.error("Error leaving community:", err);
      setError(
        err.response?.data?.error || "Nie udało się opuścić społeczności"
      );
    } finally {
      setIsJoinLoading(false);
    }
  };

  // Edit community description
  const handleEditDescription = async () => {
    try {
      setIsJoinLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/community/edit/${communityId}`,
        { description },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDescription(description); // Update local state
      setEditModalOpen(false);
      setError(null);
    } catch (err) {
      console.error("Error editing community description:", err);
      setError(
        err.response?.data?.error || "Nie udało się edytować opisu społeczności"
      );
    } finally {
      setIsJoinLoading(false);
    }
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditModalOpen(false);
    setDescription(community.description); // Reset to original description
  };

  if (!community) {
    console.log("No community data provided");
    return <div className="text-center mt-5">Ładowanie...</div>;
  }

  console.log(
    "Rendering CommunityProfile component with community:",
    community
  );
  const handleCommunityClick = (e) => {
    e.stopPropagation();
    if (!isOwner) return;
    setShowCropModal(true);
  };

  return (
    <div className=" mt-5">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex align-items-center mb-3">
          <img
                className="rounded-circle me-3"
                src={`${import.meta.env.VITE_API_URL}/img/get/community/${communityId}?q=${Date.now()}`}
                width={80}
                height={80}
                style={{
                  objectFit: "cover",
                  cursor: isOwner ? "pointer" : "default",
                }}
                onClick={handleCommunityClick}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/avatar.svg"; 
                }}
              />
            <div>
              <h2 className="card-title mb-1">{community.name}</h2>
              <p className="text-muted mb-0">
                Utworzono:{" "}
                {new Date(community.createdDate).toLocaleDateString()}
              </p>
              <p className="mb-0">{description || "Brak opisu"}</p>
            </div>
            {community.role === "owner" && (
              <button
                className="btn btn-primary ms-auto"
                onClick={() => setEditModalOpen(true)}
              >
                Edytuj opis
              </button>
            )}
            {!isOwner && (
              <button
                className={`btn ${isMember ? "btn-secondary" : "btn-primary"} ms-auto`}
                onClick={isMember ? handleLeave : handleJoin}
                disabled={isJoinLoading}
              >
                {isJoinLoading
                  ? "Ładowanie..."
                  : isMember
                    ? "Opuść społeczność"
                    : "Dołącz do społeczności"}
              </button>
            )}
          </div>

          {error && <div className="alert alert-danger">{error}</div>}
        </div>
      </div>

      {/* Edit Description Modal */}
      {editModalOpen && (
        <div
          className="modal"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closeEditModal}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edytuj opis społeczności</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeEditModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <textarea
                  className="form-control"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Wprowadź nowy opis"
                  rows={4}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeEditModal}
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEditDescription}
                  disabled={isJoinLoading}
                >
                  {isJoinLoading ? "Zapisywanie..." : "Zapisz"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showCropModal && (
        <ImageCrop
          show={showCropModal}
          onClose={() => setShowCropModal(false)}
          endPointUrl={`${import.meta.env.VITE_API_URL}/img/add/community`}
          communityId={communityId}
        />
      )}
    </div>
  );
};

export default CommunityProfile;
