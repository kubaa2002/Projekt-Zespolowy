import { createFileRoute, useLocation } from "@tanstack/react-router";
import PostsList from "../../PostsList";
import ProtectedRoute from "../../utils/ProtectedRoute";
import MainLayout from "../../components/main/MainLayout";
import CommunityProfile from "../../components/profilesLayouts/communityProfile";
import { useAuth } from "../../contexts/authProvider";
import { useEffect, useState } from "react";
import axios from "axios";
import { usePosts } from "../../contexts/PostsContext";
import QuickModal from "../../components/modals/QuickModal";
import MainModal from "../../components/modals/MainModal";
export const Route = createFileRoute("/communities/$communityId")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Communities />
      </MainLayout>
    </ProtectedRoute>
  );
}

const Communities = () => {
  const { communityId } = Route.useParams();
  const { token,user:u2 } = useAuth();
  const location = useLocation();
  const searchParams = location.search?.q;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [rotated, setRotated] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [communityId2, setCommunityId] = useState(communityId);
    const maxLength = 2000;
    const {createPost} = usePosts();

  
  
    const handlePublish = async (onClose) => {
      if (!content.trim()) {
        alert("Uzupełnij treść posta.");
        return;
      }
      console.log("tytul "+title)
    
      const postData = {
        id: 0, // zakładamy, że backend sam nadaje ID
        authorId: u2.id, // zakładamy, że masz dostęp do aktualnego użytkownika
        content: content.trim(),
        title: title.trim() || "Bez tytułu", // jeśli tytuł jest pusty, ustaw domyślny
        communityId: communityId2, // możesz zmienić na wartość z selecta, jeśli potrzebujesz
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
        onClose(); // zamknij modal
      } catch (err) {
        console.error("Błąd podczas publikacji posta:", err);
      }
    };

  useEffect(() => {
    setLoading(true);

    axios
      .get(`${import.meta.env.VITE_API_URL}/community/${communityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        console.log("User data received:", res.data);
      })
      .catch((err) => {
        console.error("AXIOS ERROR:", err);
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          err.message ||
          "Błąd ładowania użytkownika";
        setError(msg);
      })

      .finally(() => setLoading(false));
  }, [communityId, token]);

  if (loading) return <p>Ładowanie profilu...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>Nie znaleziono community</p>;
  return (
    <>
      <CommunityProfile community={user} communityId={communityId} />
      {user.isMember && (<div className={`main-think${rotated ? " main-think-open" : ""}`} style={{ marginTop: "1rem" }}>
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
                  communityId={communityId2}
                  setCommunityId={setCommunityId}
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
                  communityId={communityId2}
                  setCommunityId={setCommunityId}
                  handlePublish={handlePublish}
                  hideSelect={true}
                />
      <PostsList
        key={communityId + searchParams}
        urlWithoutQueryParams={`${import.meta.env.VITE_API_URL}/${searchParams ? "search" : "posts"}/community/${communityId}`}
        searchParams={searchParams}
      />
    </>
  );
};
