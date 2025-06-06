import { createFileRoute } from "@tanstack/react-router";
import PostsList from "../../PostsList";
import ProtectedRoute from "../../utils/ProtectedRoute";
import MainLayout from "../../components/main/MainLayout";
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
  {
    /*  Tutaj zrób logikę do fetchowania danych tak jak w $userId.jsx */
  }
  return (
    <>
      {/* A tutaj zrób layout do wyświetlenia community*/}
      <div className="zamien-mnie-na-layout"></div>
      <PostsList
        urlWithoutQueryParams={`${import.meta.env.VITE_API_URL}/posts/community/${communityId}`}
      />
    </>
  );
};
