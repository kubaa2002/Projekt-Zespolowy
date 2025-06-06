import { createFileRoute } from "@tanstack/react-router";
import SignupForm from "../components/authForms/SignupForm";
export const Route = createFileRoute("/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignupForm />;
}
