import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "../contexts/authProvider";
import MainPage from '../components/main/MainPage.jsx';
export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <MainPage />
}
/*
const auth = useAuth();
return (
  <>
    <h2>Welcome to Home Page! </h2>
    {auth.userName && <h3>Welcome {auth.userName}!</h3>}
  </>
);
}
*/