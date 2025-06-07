import { useEffect, useState,useCallback  } from "react";
import { useAuth } from "../../contexts/authProvider";
import useGetCommunities from "../../hooks/useGetCommunities";
import TextEditor from "./TextEditor";
import axios from "axios";

export default function MainModal({
  show,
  onClose,
  maxLength,
  content,
  setContent,
  file,
  handleFileChange,
  handleRemove,
  fileInputRef,
  hideSelect = false,
  handlePublish,
  communityId,
  setCommunityId
}) {
  const { user, token } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState({ type: "user", id: user?.id || "" });
  
  const getCommunities = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/${user.id}/communities`,
        getAuthConfig()
      );

      if (response.status === 200) {
        setCommunities(response.data);
      } else if (response.status === 204) {
        setCommunities([]);
      } else {
        throw new Error("Nieoczekiwany kod statusu odpowiedzi.");
      }
    } catch (err) {
      const errorMessage =
        err.response?.status === 404
          ? "Użytkownik nie istnieje."
          : err.response?.data?.error || "Błąd podczas pobierania społeczności.";
      setError(errorMessage);
      setCommunities([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, token]);

  useEffect(() => {
    if (show && user?.id) {
      getCommunities();
    }
  }, [show, user?.id, getCommunities]);

  
  
  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  const handleSelectChange = (e) => {
    const value = e.target.value;
    if (value === "user") {
      setSelectedOption({ type: "user", id: user.id });
      setCommunityId(null); 
    } else {
      const community = communities.find((c) => c.id === parseInt(value));
      setSelectedOption({ type: "community", id: community.id });
      setCommunityId(community.id);
    }
  };
  
  if (!show) return null;
  
  return (
     <div className="create-post-container">
      <div className="create-post-content">
        {!hideSelect && (
          <div className="mb-3">
            <div className="form-item">
              <label htmlFor="community" className="form-label">
                Gdzie chcesz umieścić? <span className="text-danger">*</span>
              </label>
              <select
                className="form-control"
                id="community"
                onChange={handleSelectChange}
                value={selectedOption.type === "user" ? "user" : selectedOption.id}
              >
                <option value="user">{user?.userName || "Twoje konto"}</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <div className="mb-3">
          <div className="form-item">
            <label htmlFor="title" className="form-label">
              Tytuł <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="title"
              placeholder="Zadaj pytanie lub podziel się myślą"
            />
          </div>
        </div>
        <div className="mb-3">
          <div className="form-item">
            <label htmlFor="content" className="form-label">
              Opis posta <span className="text-danger">*</span>
            </label>
            <TextEditor onContentChange={setContent} content={content} />
            <div
              style={{
                textAlign: "right",
                fontSize: "12px",
                color: content.length >= maxLength ? "red" : "#888",
              }}
            >
              {content.length}/{maxLength}
            </div>
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Dołącz zdjęcie</label>
          <div className="d-flex">
            <label
              className="btn btn-secondary"
              style={{
                cursor: file ? "not-allowed" : "pointer",
                opacity: file ? 0.4 : 1,
              }}
            >
              <i className="bi bi-upload me-2"></i>
              Prześlij
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={!!file}
              />
            </label>
          </div>
          {file && (
            <div className="card mt-2 p-2 position-relative">
              <div className="d-flex align-items-center">
                <img
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  style={{
                    width: "48px",
                    height: "48px",
                    objectFit: "cover",
                  }}
                />
                <a href={URL.createObjectURL(file)} download>
                  {file.name}
                </a>
                <button
                  type="button"
                  className="btn btn-link ms-auto"
                  onClick={handleRemove}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="create-post-footer">
        <div className="d-flex w-100 gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary w-100 btn-deny"
            onClick={onClose}
          >
            Zamknij
          </button>
          <button
            type="button"
            className="btn btn-primary w-100 btn-publish"
             onClick={()=>handlePublish(onClose)}
          >
            Publikuj
          </button>
        </div>
      </div>
    </div>
  );
}