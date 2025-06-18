import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/authProvider";
import { useNavigate, useLocation, useRouterState } from "@tanstack/react-router";
import checkIfUserOrCommunityRoute from "../../utils/isUserOrCommunityRoute";

const SearchInput = () => {
  const location = useLocation();
  const isUserOrCommunityRoute = checkIfUserOrCommunityRoute(location.pathname);
  const [searchType, setSearchType] = useState("users");
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();

  function handleSearch() {
    if (!searchValue) return;
    if (searchType === "inRoute")
      return navigate({ to: `/${location.pathname}?q=${searchValue}` });
    return navigate({ to: `/${searchType}?q=${searchValue}` });
  }

  useEffect(() => {
    setSearchType(isUserOrCommunityRoute ? "inRoute" : "users");
  }, [isUserOrCommunityRoute]);

  return (
    <div className="input-group search-group">
      <input
        type="text"
        className="form-control form-control-lg"
        placeholder="Wpisz tutaj, aby wyszukać..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <select
        name="searchType"
        id="searchType"
        className="form-control"
        onChange={(e) => setSearchType(e.currentTarget.value)}
        value={searchType}
      >
        {isUserOrCommunityRoute && (
          <option value="inRoute">Posty w wątku</option>
        )}
        <option value="users">Użytkownicy</option>
        <option value="communities">Społeczności</option>
      </select>
      <span className="input-group-text search-icon" onClick={handleSearch}>
        <i className="bi bi-search p-2" style={{ cursor: "pointer" }}></i>
      </span>
    </div>
  );
};

export default function LoggedInNavbar({ logOut, navigate, isHeroPage }) {
  const [rotated, setRotated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const modalRef = useRef();
  const mobileMenuRef = useRef(null);
  const profileRef = useRef(null); // Ref for profile div
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { user, getProfilePictureUrl } = useAuth();

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

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Close desktop dropdown only if click is outside both modal and profile
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        profileRef.current &&
        !profileRef.current.contains(e.target)
      ) {
        setRotated(false);
      }
      // Close mobile menu if click is outside mobileMenuRef
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProfileClick = (e) => {
    e.stopPropagation(); // Prevent bubbling to document
    setRotated((prev) => {
      console.log("Toggling rotated:", prev, "->", !prev); // Debug log
      return !prev;
    });
  };

  const handleMobileMenuClick = (open) => {
    setMobileMenuOpen(open);
  };

  return (
    <nav className={`${isHeroPage ? "" : "navbar-main"}`}>
      <div className="navbar navbar-logged">
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
          <SearchInput />
        </div>
        <div className="hide-on-mobile">
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
          <div className="profile" ref={profileRef} onClick={handleProfileClick}>
            <img
              className="profile-picture"
              src={getProfilePictureUrl()}
              alt="Avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/avatar.svg";
              }}
            />
            <i
              className="bi bi-triangle-fill"
              style={{
                transform: rotated ? "rotate(0deg)" : "rotate(180deg)",
                color: "black",
                cursor: "pointer",
              }}
              onClick={handleProfileClick} // Explicit handler for triangle
            ></i>
          </div>
        </div>
        <div className="show-on-mobile" ref={mobileMenuRef}>
          {mobileMenuOpen ? (
            <i
              className="bi bi-x menu-toggle-icon"
              onClick={() => handleMobileMenuClick(false)}
            ></i>
          ) : (
            <i
              className="bi bi-list menu-toggle-icon"
              onClick={() => handleMobileMenuClick(true)}
            ></i>
          )}
          {mobileMenuOpen && (
            <div className="dropdown-menu-profile">
              <ul className="dropdown-menu-list">
                <li className="dropdown-menu-item dropdown-menu-username">
                  {user.userName}
                </li>
                <li
                  className="dropdown-menu-item"
                  onClick={() => {
                    navigate({ to: `/users/${user.id}` });
                    setMobileMenuOpen(false);
                  }}
                >
                  Profil
                </li>
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
        {rotated && (
          <div className="dropdown-menu-profile" ref={modalRef}>
            <ul className="dropdown-menu-list">
              <li className="dropdown-menu-item dropdown-menu-username">
                {user.userName}
              </li>
              <li
                className={`dropdown-menu-item ${
                  currentPath === `/users/${user.id}` ? "selected" : ""
                }`}
                onClick={() => {
                  navigate({ to: `/users/${user.id}` });
                  setMobileMenuOpen(false);
                  setRotated(false);
                }}
              >
                Profil
              </li>
              <li
                className={`dropdown-menu-item ${
                  currentPath === "/communities/new" ? "selected" : ""
                }`}
                onClick={() => {
                  navigate({ to: "/communities/new" });
                  setMobileMenuOpen(false);
                  setRotated(false);
                }}
              >
                Stwórz społeczność
              </li>
              <li
                className={`dropdown-menu-item ${
                  currentPath === "/settings" ? "selected" : ""
                }`}
                onClick={() => {
                  navigate({ to: "/settings" });
                  setMobileMenuOpen(false);
                  setRotated(false);
                }}
              >
                Ustawienia
              </li>
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
    </nav>
  );
}