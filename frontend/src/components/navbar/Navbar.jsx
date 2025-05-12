import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../../contexts/authProvider";
import SearchInput from "../primitives/SearchInput";
export default function Navbar() {
  const location = useLocation();
  const isHeroPage = location.pathname === "/hero";
  const navigate = useNavigate();
  const {logOut, token, isAuthenticated} = useAuth();
  // I think we should create 2 navbars. One for each state loggedin/loggedout. Now the add Post button is visible on the hero page
  // We have to decide whether main-page is at "/" and it's structure depends on login status, or at different endpoint eg. "/hero"
  useEffect(() => {
    document.body.className = isHeroPage ? "" : "hero-page";
  }, [isHeroPage]);

  useEffect(() => {
     (async () => {
       const ok = await isAuthenticated();
       if (!ok) {
         navigate({ to: "/hero" });
      }
    })();
  }, [isAuthenticated, navigate, token]);
  
  return (
    <nav
      className={`d-flex justify-content-between align-items-center navbar ${
        isHeroPage ? "" : "navbar-main"
      }`}
    >
      <div
        className="left-sidebar"
        style={{ visibility: isHeroPage ? "hidden" : "visible" }}
      >
        <div className="headline-navbar-title">
          <i className="bi bi-heart me-2"></i>
          Vibe
        </div>
        <div className="navbar-subtitle">We absoluty do not copy reddit</div>
      </div>
      {token ? (
        <div className="d-flex flex-grow-1" style={{gap: '15px'}}>
          <SearchInput/>
          <button className="btn btn-primary btn-register">
          <i className="bi bi-plus-circle me-2"></i>
          Nowy post</button>
          <button
            className="btn btn-danger"
            onClick={() => {
              logOut();
              navigate({ to: "/login" });
            }}
          >
            Wyloguj
          </button>
        </div>
        
      ) : (
        <div className="d-flex">
          <button
            className="btn btn-primary btn-register"
            onClick={() => navigate({ to: "/signup" })}
          >
            <i className="bi bi-people me-2"></i>
            Rejestracja
          </button>
          <button
            className="btn btn-primary btn-login"
            onClick={() => navigate({ to: "/login" })}
          >
            Zaloguj
          </button>
        </div>
      )}
    </nav>
  );
}
