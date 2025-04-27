import { createFileRoute } from "@tanstack/react-router";
import LoginForm from "../components/authForms/LoginForm";
export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return <LoginForm />;
}
