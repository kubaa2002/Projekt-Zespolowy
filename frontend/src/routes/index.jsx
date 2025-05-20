import { createFileRoute } from "@tanstack/react-router";
import Main from '../components/main/Main.jsx';

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <Main />
  );
}
