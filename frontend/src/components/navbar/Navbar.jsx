import { useAuth } from "../../contexts/authProvider";
import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

export default function Navbar() {
  const auth = useAuth();
  const location = useLocation();
  const isMainPage = location.pathname === "/";

  useEffect(() => {
    document.body.className = isMainPage ? "" : "main-page";
  }, [isMainPage]);

  return (
    <nav
      className={`d-flex justify-content-between align-items-center navbar ${
        isMainPage ? "" : "navbar-main"
      }`}
    >
      <div
        className="left-sidebar"
        style={{ visibility: isMainPage ? "hidden" : "visible" }}
      >
        <div className="headline-navbar-title">
          <i className="bi bi-heart me-2"></i>
          Vibe {/* TODO: glupio miga */}
        </div>
        <div className="navbar-subtitle">
          We absoluty do not copy reddit
        </div>
      </div>
      <div className="d-flex">
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
      </div>
    </nav>
  );
}
