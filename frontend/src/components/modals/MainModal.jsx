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
}) {
  if (!show) return null;

  return (
     <div className="create-post-container">
      <div className="create-post-content">
        <div className="mb-3">
          <div className="form-item">
            <label htmlFor="community" className="form-label">
              Gdzie chcesz umieścić? <span className="text-danger">*</span>
            </label>
            <select className="form-control" id="community">
              <option value="user">Nazwa użytkownika</option>
              <option value="community1">Społeczność 1</option>
              <option value="community2">Społeczność 2</option>
            </select>
          </div>
        </div>
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
            <textarea
              className="form-control"
              id="content"
              rows={10}
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
            // onClick={handlePublish}
          >
            Publikuj
          </button>
        </div>
      </div>
    </div>
  );
}