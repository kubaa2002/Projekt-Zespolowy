import { createFileRoute, useLocation } from "@tanstack/react-router";
import ProtectedRoute from "../../utils/ProtectedRoute";
import MainLayout from "../../components/main/MainLayout.jsx";
import axios from "axios";
import { useAuth } from "../../contexts/authProvider.jsx";
import { useState, useEffect } from "react";
import Profile from "../../components/profilesLayouts/profile.jsx";
import PostsList from "../../PostsList.jsx";
export const Route = createFileRoute("/users/$userId")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <ProfilePage />
      </MainLayout>
    </ProtectedRoute>
  );
}

const ProfilePage = () => {
  const { userId } = Route.useParams();
  const { token } = useAuth();
  const location = useLocation();
  const searchParams = location.search?.q;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);

    axios
      .get(`${import.meta.env.VITE_API_URL}/user/${userId}`, {
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
    console.log("User data fetched:", user);
    console.log("User ID:", userId);
  }, [userId, token]);

  if (loading) return <p>Ładowanie profilu...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>Nie znaleziono użytkownika</p>;

  return (
    <>
      <Profile user={user} />
      <PostsList
        key={userId + searchParams}
        urlWithoutQueryParams={`${import.meta.env.VITE_API_URL}/${searchParams ? "search" : "posts"}/user/${userId}`}
        searchParams={searchParams}
      />
    </>
  );
};
