import SearchInput from "../primitives/SearchInput";
import { useState, useEffect } from "react";

export default function LoggedInNavbar({ logOut, navigate, isHeroPage }) {
  const [rotated, setRotated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1600) {
        setMobileMenuOpen(false);
      } else {
        setRotated(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleProfileClick = () => {
    setRotated((r) => {
      if (!r) setMobileMenuOpen(false);
      return !r;
    });
  };

  const handleMobileMenuClick = () => {
    setMobileMenuOpen((open) => {
      if (!open) setRotated(false);
      return !open;
    });
  };

  return (
    <nav className={`${isHeroPage ? "" : "navbar-main"}`}>
      <div className="navbar navbar-logged">
        {/* navigate to / or /hero? */}
        <div className="left-sidebar" style={{ visibility: isHeroPage ? "hidden" : "visible" }} onClick={() => navigate({to: '/'})}>
          <div className="headline-navbar-title">
            <i className="bi bi-heart me-2"></i>
            Vibe
          </div>
          <div className="navbar-subtitle">We absolutely do not copy reddit</div>
        </div>
        <div className="navbar-searchbar">
          <SearchInput />
        </div>
        <div className="hide-on-mobile">
          <button
            className="btn btn-primary btn-register btn-register-post" onClick={() => navigate({ to: "/create?type=post" })}>
            <i className="bi bi-plus-circle me-2"></i>
            Nowy post
          </button>
          <div className="notification-icon">
            <i className="bi bi-bell-fill" ></i>
            <img src="elipse.svg" alt="Elipse" className="elipse"/>
          </div>
          <div className="profile" onClick={handleProfileClick}>
            <img src="avatar.svg" alt="Avatar"/>
            <i className="bi bi-triangle-fill"
              style={{
                transform: rotated ? "rotate(0deg)" : "rotate(180deg)",
                color: "black",
                cursor: "pointer",
              }}  
            ></i>
          </div>
        </div>
        {/* Ikona menu na mobile */}
        <div className="show-on-mobile">
          <i
            className={`${mobileMenuOpen ? "bi bi-x" : "bi bi-list"} menu-toggle-icon`}
            onClick={handleMobileMenuClick}
          ></i>
          {mobileMenuOpen && (
            <div className="dropdown-menu-profile">
              <ul className="dropdown-menu-list">
                <li className="dropdown-menu-item dropdown-menu-username">Nazwa użytkownika</li>
                <li className="dropdown-menu-item">Profil</li>
                <li className="dropdown-menu-item"
                  onClick={() => {
                    navigate({ to: "/create?type=post" });
                    setMobileMenuOpen(false);
                 }}
                >Nowy post</li>
                <li className="dropdown-menu-item"
                  onClick={() => {
                    navigate({ to: "/create?type=community" });
                    setMobileMenuOpen(false);
                 }}
                >Stwórz społeczność</li>
                <li className="dropdown-menu-item">Powiadomienia</li>
                <li className="dropdown-menu-item" 
                  onClick={() => {
                    navigate({ to: "/settings" });
                    setMobileMenuOpen(false);
                 }}
                >Ustawienia</li>
                <li className="dropdown-menu-item">Ciemny motyw</li>
                <li className="dropdown-menu-item"
                  onClick={() => {
                    logOut();
                    navigate({ to: "/login" });
                  }}
                >
                  Wyloguj
                </li>
              </ul>
            </div>
          )}
        </div>
        {/* Dropdown na desktopie */}
        {rotated && (
          <div className="dropdown-menu-profile">
            <ul className="dropdown-menu-list">
              <li className="dropdown-menu-item dropdown-menu-username">Nazwa użytkownika</li>
              <li className="dropdown-menu-item">Profil</li>
              <li className="dropdown-menu-item"
                onClick={() => {
                  navigate({ to: "/create?type=community" });
                  setMobileMenuOpen(false);
                }}
              >Stwórz społeczność</li>
              <li className="dropdown-menu-item" 
                onClick={() => {
                  navigate({ to: "/settings" });
                  setMobileMenuOpen(false);
                }}>Ustawienia</li>
              <li className="dropdown-menu-item">Ciemny motyw</li>
              <li
                className="dropdown-menu-item"
                onClick={() => {
                  logOut();
                  navigate({ to: "/login" });
                }}
              >
                Wyloguj
              </li>
            </ul>
          </div>
        )}
      </div>
      <ul className="navbar-nav">
        <li className="nav-item nav-item-active">
          <button
            type="button"
            className="nav-link active"
            onClick={() => navigate({ to: "/" })}
          >
            Ogólne
          </button>
        </li>
        <li className="nav-item">
          <button type="button" className="nav-link disabled">
            Obserwowane
          </button>
        </li>
      </ul>
    </nav>
  );
}