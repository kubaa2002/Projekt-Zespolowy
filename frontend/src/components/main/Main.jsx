import { useState } from "react";
import MainModal from "../modals/MainModal";
import QuickModal from "../modals/QuickModal";
import MainLayout from "./MainLayout";
import PostsList from "../../PostsList";
import { usePosts } from "../../contexts/PostsContext";
import { useAuth } from "../../contexts/authProvider";

export default function Main() {
  const [rotated, setRotated] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [communityId, setCommunityId] = useState(null);
  const maxLength = 2000;
  const {createPost} = usePosts();
  const {user} = useAuth();


  const handlePublish = async (onClose) => {
    if (!content.trim()) {
      alert("Uzupełnij treść posta.");
      return;
    }
  
    const postData = {
      id: 0, // zakładamy, że backend sam nadaje ID
      authorId: user.id, // zakładamy, że masz dostęp do aktualnego użytkownika
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

  return (
    <MainLayout>
        <div className={`main-think${rotated ? " main-think-open" : ""}`}>
          <img src={`${import.meta.env.VITE_API_URL}/img/get/user/${user?.id}`} alt="Avatar" className="avatar" onError={(e) => {
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
            setCommunityId={setCommunityId}
            title={title}
            setTitle={setTitle}
            handlePublish={handlePublish}
          />
        </div>
          <MainModal
            show={rotated}
            onClose={() => {setRotated(false); setContent("");}}
            maxLength={maxLength}
            content={content}
            setContent={setContent}
            title={title}
            setTitle={setTitle}
            communityId={communityId}
            setCommunityId={setCommunityId}
            handlePublish={handlePublish}
          />
        
        <PostsList urlWithoutQueryParams={`${import.meta.env.VITE_API_URL}/posts`}/> {/* solution for now? im lazy*/}
        
    </MainLayout>
  );
}
