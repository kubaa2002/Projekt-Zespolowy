import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { useAuth } from "../../contexts/authProvider";
const maxLength = 500;

export default function NewCommunity() {
  const [name, setName] = useState("");
  const [description, setDescritption] = useState("");
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreated, setIsCreated] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const validateRealtime = () => {
      setIsCreated(false);
      setNameError(name.trim() ? "" : "Nazwa społeczności jest wymagana.");
      setDescriptionError(description.trim() ? "" : "Opis jest wymagany.");
      if (description.length > maxLength) {
        setDescriptionError(`Opis nie może przekraczać ${maxLength} znaków.`);
      }
    };

    if (name || description) {
        validateRealtime();
    }

  }, [name, description]);

  const createCommunity = async () => {
    setIsCreated(false);
    setNameError("");
    setDescriptionError("");

    if (!name.trim()) {
      setNameError("Nazwa społeczności jest wymagana.");
      return;
    }

    if (!description.trim()) {
      setDescriptionError("Opis jest wymagany.");
      return;
    }

    if (description.length > maxLength) {
      setDescriptionError(`Opis nie może przekraczać ${maxLength} znaków.`);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/community/new`,
        {
          name: name.trim(),
          description: description.trim(),
        },
        getAuthConfig()
      );
      if (response.status === 201) {
        setIsCreated(true);
       setTimeout(()=> {
        navigate({ to: `/communities/${response.data.id}`})
       }, 1000)

      } else {
        setErrorMessage("Failed to connect to the server");
      }
    } catch (error) {
        if (error.response && error.response.data) {
          const data = error.response.data;
      
          if (typeof data === "string") {
            if (data.toLowerCase().includes("nazwa")) {
              setNameError(data);
            } else if (data.toLowerCase().includes("opis")) {
              setDescriptionError(data);
            } else {
              setErrorMessage(data);
            }
          } else {
            setErrorMessage("Wystąpił nieoczekiwany błąd.");
          }
        } else {
          setErrorMessage("Nie udało się połączyć z serwerem.");
        }
      }
  };

  return (
    <div
      className="create-post-container"
      style={{
        maxWidth: "800px",
        maxHeight: "500px",
        justifySelf: "center",
        alignSelf: "center",
      }}
    >
      <div className="create-post-content">
        <div className="mb-3">
          <div className="form-item">
            <label htmlFor="name" className="form-label user-select-none">
              Nazwa społeczności <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className={`form-control ${nameError ? "is-invalid" : ""}`}
              id="name"
              placeholder="Nazwa społeczności"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {nameError && <div className="invalid-feedback user-select-none">{nameError}</div>}
          </div>
        </div>
        <div className="mb-3">
          <div className="form-item">
            <label htmlFor="description" className="form-label user-select-none">
              Opis <span className="text-danger user-select-none">*</span>
            </label>
            <textarea
              rows="4"
              name="description"
              id="description"
              maxLength="500"
              className={`form-control ${descriptionError ? "is-invalid" : ""}`}
              placeholder="Opis"
              value={description}
              onChange={(e) => setDescritption(e.target.value)}
              style={{
                resize: "vertical",
                maxHeight: "250px",
              }}
            />

            <div
              style={{
                textAlign: "right",
                fontSize: "12px",
                color: description.length >= maxLength ? "red" : "#888",
              }}
              className="user-select-none"
            >
              {description.length}/{maxLength}
            </div>
            {descriptionError && (
              <div className="invalid-feedback user-select-none">{descriptionError}</div>
            )}
          </div>
        </div>
      </div>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {isCreated && <div className="success-message">Nowa społeczność utworzona!</div>} {/* Maybe redirect and toast in the future */}
      <div className="create-post-footer">
        <div className="d-flex w-100 gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary w-100 btn-deny user-select-none"
            onClick={() => navigate({ to: "/" })}
          >
            Anuluj
          </button>
          <button
            type="button"
            className="btn btn-primary w-100 btn-publish user-select-none"
            onClick={createCommunity}
          >
            Stwórz społeczność
          </button>
        </div>
      </div>
    </div>
  );
}
