import { useRef, useState } from "react";
import SideNav from "../sidenavbar/SideNav";
import MainModal from "../modals/MainModal";
import QuickModal from "../modals/QuickModal";

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
            <span className="text-think">
              Podziej się tym, co masz na myśli
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
              onClose={() => setShowModal(false)}
              maxLength={maxLength}
              content={content}
              setContent={setContent}
              file={file}
              handleFileChange={handleFileChange}
              handleRemove={handleRemove}
              fileInputRef={fileInputRef}
            />
          </div>
          <MainModal
            show={rotated}
            onClose={() => setRotated(false)}
            maxLength={maxLength}
            content={content}
            setContent={setContent}
            file={file}
            handleFileChange={handleFileChange}
            handleRemove={handleRemove}
            fileInputRef={fileInputRef}
          />
          <div className="dropdown-sort">
            <button
              className="btn btn-secondary dropdown-toggle btn-sort"
              type="button"
              onClick={() => setShowSort((o) => !o)}
            >
              Najnowsze
            </button>
            <ul
              className="dropdown-menu dropdown-menu-custom"
              style={{
                display: showSort ? "block" : "none",
                position: "absolute",
              }}
            >
              <li className="dropdown-item dropdown-item-sort">
                Sortuj według
              </li>
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
