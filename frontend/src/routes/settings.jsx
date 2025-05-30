import { createFileRoute } from "@tanstack/react-router";
import Settings from "../components/settings/Settings";
import ProtectedRoute from "../utils/ProtectedRoute";
export const Route = createFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  );
}
