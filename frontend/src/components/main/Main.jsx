import { useRef, useState } from "react";
import MainModal from "../modals/MainModal";
import QuickModal from "../modals/QuickModal";
import MainLayout from "./MainLayout";
import PostsList from "../../PostsList";
import { usePosts } from "../../contexts/PostsContext";
import { useAuth } from "../../contexts/authProvider";

export default function Main() {
  const [rotated, setRotated] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [communityId, setCommunityId] = useState(null);
  const maxLength = 2000;
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const {createPost} = usePosts();
  const {user} = useAuth();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleRemove = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePublish = async (onClose,post) => {
    if (!content.trim()) {
      alert("Uzupełnij treść posta.");
      return;
    }
  
    const postData = {
      id: 0, // zakładamy, że backend sam nadaje ID
      authorId: user.id, // zakładamy, że masz dostęp do aktualnego użytkownika
      content: content.trim(),
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
      handleRemove(); // usuń załączony plik
      onClose(); // zamknij modal
    } catch (err) {
      console.error("Błąd podczas publikacji posta:", err);
    }
  };

  return (
    <MainLayout>
        <div className={`main-think${rotated ? " main-think-open" : ""}`}>
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
            onClose={() => {setShowModal(false); setContent(""); handleRemove();}}
            maxLength={maxLength}
            content={content}
            setContent={setContent}
            communityId={communityId}
            setCommunityId={setCommunityId}
            file={file}
            handleFileChange={handleFileChange}
            handleRemove={handleRemove}
            fileInputRef={fileInputRef}
            handlePublish={handlePublish}
          />
        </div>
          <MainModal
            show={rotated}
            onClose={() => {setRotated(false); setContent(""); handleRemove();}}
            maxLength={maxLength}
            content={content}
            setContent={setContent}
            communityId={communityId}
            setCommunityId={setCommunityId}
            file={file}
            handleFileChange={handleFileChange}
            handleRemove={handleRemove}
            fileInputRef={fileInputRef}
            handlePublish={handlePublish}
          />
        
        <PostsList showSort={showSort} setShowSort={setShowSort} />
        
    </MainLayout>
  );
}
