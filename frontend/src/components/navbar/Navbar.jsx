import { useAuth } from "../../contexts/authProvider";
import { Link} from "@tanstack/react-router";
import "./navbar.css";
export default function Navbar() {
  const auth = useAuth();
  return (
      <nav>
          <Link
            to="/"
            className="home-link"
            activeProps={{
              style: {
                color: "rgb(255, 0, 234)",
              },
            }}
          >
            Home
          </Link>
          <Link
            to="/posts"
            activeProps={{
              style: {
                color: "rgb(255, 0, 234)",
              },
            }}
          >
            Posts
          </Link>
          <Link
            to="/login"
            activeProps={{
              style: {
                color: "rgb(255, 0, 234)",
              },
            }}
          >
            Login
          </Link>
          <Link
            to="/signup"
            activeProps={{
              style: {
                color: "rgb(255, 0, 234)",
              },
            }}
          >
            Signup
          </Link>
          <button onClick={auth.logOut}>Logout</button>
      </nav>
  );
}
