import { createFileRoute } from "@tanstack/react-router";
import Main from "../components/main/Main.jsx";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <ProtectedRoute>
      <Main />
    </ProtectedRoute>
  );
}
