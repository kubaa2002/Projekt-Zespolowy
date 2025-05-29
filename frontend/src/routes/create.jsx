import { createFileRoute } from "@tanstack/react-router";
import Create from "../components/create/Create.jsx";
import ProtectedRoute from "../utils/ProtectedRoute.jsx";
export const Route = createFileRoute("/create")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <Create />
    </ProtectedRoute>
  );
}
