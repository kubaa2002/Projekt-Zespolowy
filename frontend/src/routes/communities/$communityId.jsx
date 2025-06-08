import { createFileRoute } from "@tanstack/react-router";
import PostsList from "../../PostsList";
import ProtectedRoute from "../../utils/ProtectedRoute";
import MainLayout from "../../components/main/MainLayout";
import CommunityProfile from "../../components/profilesLayouts/communityProfile";
import { useAuth } from "../../contexts/authProvider";
import { useEffect, useState } from "react";
import axios from "axios";
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
  const { token } = useAuth();
  
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    axios
      .get(`${import.meta.env.VITE_API_URL}/community/${communityId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {setUser(res.data)

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
  {
    /*  Tutaj zrób logikę do fetchowania danych tak jak w $userId.jsx */
  }
  return (
    <>
      {/* A tutaj zrób layout do wyświetlenia community*/}
      <CommunityProfile community={user} communityId={communityId}/>
      <PostsList key={communityId}
        urlWithoutQueryParams={`${import.meta.env.VITE_API_URL}/posts/community/${communityId}`}
      />
    </>
  );
};
