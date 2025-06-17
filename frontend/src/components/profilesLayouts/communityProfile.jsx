import React, { useState } from "react";
import axios from "axios";
import "./profile.scss";
import ImageCrop from "../modals/ImageCrop";
import MainModal from "../modals/MainModal";
import { useAuth } from "../../contexts/authProvider";
import { usePosts } from "../../contexts/PostsContext";
import QuickModal from "../modals/QuickModal";

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

   const { user:u2 } = useAuth();
   const [rotated, setRotated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const maxLength = 2000;
    const {createPost} = usePosts();
  
  
    const handlePublish = async (onClose) => {
      if (!content.trim()) {
        alert("Uzupełnij treść posta.");
        return;
      }
    
      const postData = {
        id: 0, // zakładamy, że backend sam nadaje ID
        authorId: u2.id, // zakładamy, że masz dostęp do aktualnego użytkownika
        content: content.trim(),
        title: title.trim() || "Bez tytułu", // jeśli tytuł jest pusty, ustaw domyślny
        communityId: communityId, // możesz zmienić na wartość z selecta, jeśli potrzebujesz
        createdDateTime: new Date().toISOString(),
        parentId: null,
        isDeleted: false,
      };
    
      try {
        const createdPost = await createPost(postData);
    
        // Jeśli chcesz dodać logikę dla pliku:
        /*if (file) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("postId", createdPost.id);
          await axios.post(`${import.meta.env.VITE_API_URL}/posts/${createdPost.id}/image`, formData, getAuthConfig());
        }*/
        console.log("Post opublikowany:", createdPost);
        // Resetowanie stanu po publikacji
        setContent("");
        setTitle("");
        onClose(); // zamknij modal
      } catch (err) {
        console.error("Błąd podczas publikacji posta:", err);
      }
    };

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
    <>
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
    {isMember && (<div className={`main-think${rotated ? " main-think-open" : ""}`} style={{ marginTop: "1rem" }}>
                <img src={`${import.meta.env.VITE_API_URL}/img/get/user/${u2?.id}`} alt="Avatar" className="avatar" onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/avatar.svg"; 
                }}/>
                <span className="text-think user-select-none" onClick={() => setRotated((r) => !r)}>
                  Podziel się tym, co masz na myśli
                </span>
                <div className="buttons-think">
                  <button
                    className="btn btn-plus"
                    type="button"
                    onClick={() => setShowModal((prev) => !prev)}
                    disabled={rotated}
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                  <i
                    className="bi bi-chevron-up"
                    style={{
                      transform: rotated ? "rotate(0deg)" : "rotate(180deg)",
                      color: "black",
                      cursor: showModal ? "not-allowed" : "pointer",
                      pointerEvents: showModal ? "none" : "auto",
                      opacity: showModal ? 0.5 : 1,
                    }}
                    onClick={() => setRotated((r) => !r)}
                  ></i>
                </div>
                  <QuickModal
                  show={showModal}
                  onClose={() => {setShowModal(false); setContent("");}}
                  maxLength={maxLength}
                  content={content}
                  setContent={setContent}
                  communityId={communityId}
                  setCommunityId={setContent}
                  title={title}
                  setTitle={setTitle}
                  handlePublish={handlePublish}
                  hideSelect={true}
                />
              </div>)}
      
                <MainModal
                  show={rotated}
                  onClose={() => {setRotated(false); setContent("");}}
                  maxLength={maxLength}
                  content={content}
                  setContent={setContent}
                  title={title}
                  setTitle={setTitle}
                  communityId={communityId}
                  setCommunityId={setContent}
                  handlePublish={handlePublish}
                  hideSelect={true}
                />
    </>
  );
};

export default CommunityProfile;
