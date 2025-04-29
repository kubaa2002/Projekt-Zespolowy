import { useAuth } from "../../contexts/authProvider";
export default function Navbar() {
  const auth = useAuth();
  return (
      <nav
        className="d-flex justify-content-end align-items-center"
        style={{
          paddingRight: "2vw",
          marginTop: "4vh",
        }}
      >
        <button
          className="btn btn-primary btn-register"
          onClick={() => (window.location.href = "/signup")}
        >
          <i className="bi bi-people me-2"></i>
          Rejestracja
        </button>
        <button
          className="btn btn-primary btn-login"
          onClick={() => (window.location.href = "/login")}
        >
          Zaloguj
        </button>
        <button onClick={auth.logOut}>Logout</button>
      </nav>
  );
}
