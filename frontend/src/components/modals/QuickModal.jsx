import { useEffect, useState,useCallback  } from "react";
import { useAuth } from "../../contexts/authProvider";
import axios from "axios";

export default function QuickModal({
  show,
  onClose,
  maxLength,
  content,
  setContent,
  title, 
  setTitle,
  handlePublish,
  communityId,
  setCommunityId
}) {
  if (!show) return null;
  const { user, token } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOption, setSelectedOption] = useState({ type: "user", id: user?.id || "" });


  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });


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

  return (
   <div className="modal fade show modal-custom">
      <div className="modal-dialog modal-dialog-custom">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title user-select-none">Szybki post</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <div className="form-item">
                <label htmlFor="title" className="form-label user-select-none">
                  Gdzie chcesz umieścić? <span className="text-danger">*</span>
                </label>
                <select
                className="form-control"
                id="community"
                onChange={handleSelectChange}
                value={selectedOption.type === "user" ? "user" : selectedOption.id}
              >
                <option value="user">Mój profil</option>
                {communities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
              </div>
            </div>
            <div className="mb-3">
              <div className="form-item">
                <label htmlFor="title" className="form-label user-select-none">
                  Tytuł <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  placeholder="Zadaj pytanie lub podziel się myślą"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)} 
                />
              </div>
            </div>
            <div className="mb-3">
              <div className="form-item">
                <label htmlFor="content" className="form-label  user-select-none">
                  Opis posta <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  id="content"
                  rows={5}
                  placeholder="Tutaj możesz dodać więcej szczegółów"
                  maxLength={maxLength}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <div
                  style={{
                    textAlign: "right",
                    fontSize: "12px",
                    color: content.length >= maxLength ? "red" : "#888",
                  }}
                  className="user-select-none"
                >
                  {content.length}/{maxLength}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
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
                onClick={()=> handlePublish(onClose)}
              >
                Publikuj
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}