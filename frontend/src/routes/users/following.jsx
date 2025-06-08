import { createFileRoute } from "@tanstack/react-router";
import SearchProfile from "../../components/profilesLayouts/SearchProfile";
import useGetFollowingUsers from "../../hooks/useGetFollowingUsers";
import MainLayout from "../../components/main/MainLayout";
import ProtectedRoute from "../../utils/ProtectedRoute";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider";
export const Route = createFileRoute("/users/following")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <FollowingUsers />
      </MainLayout>
    </ProtectedRoute>
  );
}

function FollowingUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { users, isLoading, error } = useGetFollowingUsers(user?.id);
  if (isLoading) return <div>Ładowanie...</div>;
  if (error) return <div>Error: {error.message}</div>;
  console.log(users);

  return (
    <>
      {users.map(user => (
        <div className="profile-card"
             key={user.id}
             onClick={() => navigate({ to: `/users/${user.id}` })}
             style={{ cursor: "pointer" }}
        >
          <SearchProfile user={user} />
        </div>
      ))}
    </>
  );
    
}
