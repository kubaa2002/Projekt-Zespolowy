import { useRef, useState } from "react";


const SideNav = () => {
    return (
        <div className="side-wrapper">
            <div className="side-list-wrapper">
                <h2>Hello</h2>
            </div>
        </div>
    );
}

export default function Main() {
    const [rotated, setRotated] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState("");
    const maxLength = 2000;
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleRemove = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <>
            <div className="main-container">
                <SideNav />
                <div className="main-wrapper">
                    <div className="main-think">
                        <img src="avatar.svg" alt="Avatar" className="avatar" />
                        <span className="text-think">Podziej się tym, co masz na myśli</span>
                        <div className="buttons-think">
                            <button
                                className="btn btn-plus"
                                type="button"
                                onClick={() => setShowModal(true)}
                                disabled={rotated}
                            >
                                <i className="bi bi-plus"></i>
                            </button>
                            <i className="bi bi-chevron-up"
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
                        {showModal && (
                            <div className="modal fade show modal-custom">
                                <div className="modal-dialog modal-dialog-custom">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Szybki post</h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => setShowModal(false)}
                                            ></button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="mb-3">
                                                <div className="form-item">
                                                    <label htmlFor="title" className="form-label">Gdzie chcesz umieścić? <span className="text-danger">*</span></label>
                                                    <select className="form-control" id="community">
                                                        <option value="user">Nazwa użytkownika</option>
                                                        <option value="community1">Społeczność 1</option>
                                                        <option value="community2">Społeczność 2</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <div className="form-item">
                                                    <label htmlFor="title" className="form-label">Tytuł <span className="text-danger">*</span></label>
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
                                                        rows={5}
                                                        placeholder="Tutaj możesz dodać więcej szczegółów"
                                                        maxLength={maxLength}
                                                        value={content}
                                                        onChange={e => setContent(e.target.value)}
                                                    />
                                                    <div style={{ textAlign: "right", fontSize: "12px", color: content.length >= maxLength ? "red" : "#888" }}>
                                                        {content.length}/{maxLength}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Dołącz zdjęcie</label>
                                                <div className="d-flex">
                                                     <label className="btn btn-secondary" style={{ cursor: file ? "not-allowed" : "pointer", opacity: file ? 0.4 : 1 }}>
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
                                                            style={{ width: "48px", height: "48px", objectFit: "cover" }}
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
                                        <div className="modal-footer">
                                            <div className="d-flex w-100 gap-2">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary w-100 btn-deny"
                                                    onClick={() => setShowModal(false)}
                                                >
                                                    Zamknij
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-primary w-100 btn-publish"
                                                    // onClick={handlePublish} // dodanie posta
                                                >
                                                    Publikuj
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {rotated && (
                        <div className="create-post-container">
                            <div className="create-post-content">
                                <div className="mb-3">
                                    <div className="form-item">
                                        <label htmlFor="community" className="form-label">Gdzie chcesz umieścić? <span className="text-danger">*</span></label>
                                        <select className="form-control" id="community">
                                            <option value="user">Nazwa użytkownika</option>
                                            <option value="community1">Społeczność 1</option>
                                            <option value="community2">Społeczność 2</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <div className="form-item">
                                        <label htmlFor="title" className="form-label">Tytuł <span className="text-danger">*</span></label>
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
                                            onChange={e => setContent(e.target.value)}
                                        />
                                        <div style={{ textAlign: "right", fontSize: "12px", color: content.length >= maxLength ? "red" : "#888" }}>
                                            {content.length}/{maxLength}
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Dołącz zdjęcie</label>
                                    <div className="d-flex">
                                            <label className="btn btn-secondary" style={{ cursor: file ? "not-allowed" : "pointer", opacity: file ? 0.4 : 1 }}>
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
                                                style={{ width: "48px", height: "48px", objectFit: "cover" }}
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
                                        //onClick={() => setShowModal(false)}
                                    >
                                        Zamknij
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-primary w-100 btn-publish"
                                        // onClick={handlePublish} // dodanie posta
                                    >
                                        Publikuj
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="dropdown-sort">
                        <button className="btn btn-secondary dropdown-toggle btn-sort" type="button" onClick={() => setShowSort((o) => !o)}>
                            Najnowsze
                        </button>
                        <ul
                            className="dropdown-menu dropdown-menu-custom"
                            style={{
                                display: showSort ? "block" : "none",
                                position: "absolute",
                            }}
                        >
                            <li className="dropdown-item dropdown-item-sort">Sortuj według</li>
                            <li className="dropdown-item">Najnowsze</li>
                            <li className="dropdown-item">Najbardziej likowane</li>
                        </ul>
                    </div>
                    <div className="no-more-posts">
                        Nie ma już więcej postów do załadowania
                    </div>
                </div>
            </div>
        </>
    );
}