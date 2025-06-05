import { useState, useEffect, useRef} from "react";
import { useAuth } from "../../contexts/authProvider";
import { useNavigate } from "@tanstack/react-router";
import { useLocation } from "@tanstack/react-router";
const SearchInput = ({ value, setValue }) => {
  return (
    <div className="input-group search-group">
      <input
        type="text"
        className="form-control form-control-lg"
        placeholder="Wpisz tutaj, aby wyszukać..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};
const SearchSections = ({ value, isSearchingPosts }) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <ul className="navbar-nav">
      {isSearchingPosts && (
        <li className="nav-item nav-item-active">
          <button
            type="button"
            className="nav-link active"
            onClick={() => navigate({ to: "/" })}
          >
            Posty w wątku
          </button>
        </li>
      )}
      <li
        className={`nav-item ${location.pathname === "/users" ? "nav-item-active" : ""}`}
      >
        <button
          type="button"
          className="nav-link active"
          onClick={() => navigate({ to: `/users?q=${value}` })}
        >
          Użytkownicy
        </button>
      </li>
      <li
        className={`nav-item ${location.pathname === "/communities" ? "nav-item-active" : ""}`}
      >
        <button
          type="button"
          className="nav-link active"
          onClick={() => navigate({ to: `/communities?q=${value}` })}
        >
          Społeczności
        </button>
      </li>
    </ul>
  );
};

export default function LoggedInNavbar({ logOut, navigate, isHeroPage }) {
  const location = useLocation();
  const additionalPath = location.pathname.split("/")[2];
  const isSearchingPosts = !isNaN(Number(additionalPath)); // server endpoints only search posts in communities and users, by specyfing additional id parameter
  const [searchValue, setSearchValue] = useState("");
  const [rotated, setRotated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const modalRef = useRef();

  const auth = useAuth();
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
  // useEffect(() => {
  //   const handleClickOutside = (e) => {
  //     if (modalRef.current && (!modalRef.current.contains(e.target))) {
  //       setMobileMenuOpen(false);
  //       setRotated(false);
  //     }
  //   };
  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => document.removeEventListener("mousedown", handleClickOutside);
  // }, []);

  const handleProfileClick = () => {
    setRotated((rotated) => !rotated);
  };

  const handleMobileMenuClick = () => {
    setMobileMenuOpen((mobileMenuOpen) => !mobileMenuOpen);
  };

  return (
    <nav className={`${isHeroPage ? "" : "navbar-main"}`}>
      <div className="navbar navbar-logged">
        {/* navigate to / or /hero? */}
        <div
          className="left-sidebar"
          style={{ visibility: isHeroPage ? "hidden" : "visible" }}
          onClick={() => {
            setMobileMenuOpen(false);
            setRotated(false);
            navigate({ to: "/" });
          }}
        >
          <div className="headline-navbar-title">
            <i className="bi bi-heart me-2"></i>
            Vibe
          </div>
          <div className="navbar-subtitle">
            We absolutely do not copy reddit
          </div>
        </div>
        <div className="navbar-searchbar">
          <SearchInput value={searchValue} setValue={setSearchValue} />
        </div>
        <div className="hide-on-mobile">
          {/* change to community */}
          <button
            className="btn btn-primary btn-register btn-register-post"
            onClick={() => {
              navigate({ to: "/communities/new" });
              setRotated(false);
              setMobileMenuOpen(false);
            }}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Stwórz społeczność
          </button>
          <div className="profile" onClick={handleProfileClick}>
            <img src="avatar.svg" alt="Avatar" />
            <i
              className="bi bi-triangle-fill"
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
                <li className="dropdown-menu-item dropdown-menu-username">
                  {auth.user.userName}
                </li>
                <li className="dropdown-menu-item">Profil</li>
                <li
                  className="dropdown-menu-item"
                  onClick={() => {
                    navigate({ to: "/communities/new" });
                    setMobileMenuOpen(false);
                  }}
                >
                  Stwórz społeczność
                </li>
                <li
                  className="dropdown-menu-item"
                  onClick={() => {
                    navigate({ to: "/settings" });
                    setMobileMenuOpen(false);
                  }}
                >
                  Ustawienia
                </li>
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
        {/* Dropdown na desktopie */}
        {rotated && (
          <div className="dropdown-menu-profile" ref={modalRef}>
            <ul className="dropdown-menu-list">
              <li className="dropdown-menu-item dropdown-menu-username">
                {auth.user.userName}
              </li>
              <li className="dropdown-menu-item">Profil</li>
              <li
                className="dropdown-menu-item"
                onClick={() => {
                  navigate({ to: "/communities/new" });
                  setMobileMenuOpen(false);
                }}
              >
                Stwórz społeczność
              </li>
              <li
                className="dropdown-menu-item"
                onClick={() => {
                  navigate({ to: "/settings" });
                  setMobileMenuOpen(false);
                }}
              >
                Ustawienia
              </li>
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
      <SearchSections value={searchValue} isSearchingPosts={isSearchingPosts} />
    </nav>
  );
}
