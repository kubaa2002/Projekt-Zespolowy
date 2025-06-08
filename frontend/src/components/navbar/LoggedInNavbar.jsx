import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/authProvider";
import { useNavigate } from "@tanstack/react-router";
const SearchInput = () => {
  const [searchType, setSearchType] = useState("users");
  const [searchValue, setSearchValue] = useState("");
  const navigate = useNavigate();
 
  function handleSearch() {
    return navigate({ to: `/${searchType}?q=${searchValue}` });
  }

  return (
    <div className="input-group search-group">
      <input
        type="text"
        className="form-control form-control-lg"
        placeholder={`Wpisz tutaj, aby wyszukać...`}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <select
        name="searchType"
        id="searchType"
        className="form-control"
        onChange={(e) => setSearchType(e.currentTarget.value)}
      >
        <option value="users">Użytkownicy</option>
        <option value="communities">Społeczności</option>
      </select>
      <span className="input-group-text search-icon" onClick={handleSearch}>
        <i className="bi bi-search p-2" style={{ cursor: "pointer" }}></i>
      </span>
    </div>
  );
};
// const SearchSections = ({ value, isSearchingPosts }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   return (
//     <ul className="navbar-nav">
//       {isSearchingPosts && (
//         <li className="nav-item nav-item-active">
//           <button
//             type="button"
//             className="nav-link active"
//             onClick={() => navigate({ to: "/" })}
//           >
//             Posty w wątku
//           </button>
//         </li>
//       )}
//       <li
//         className={`nav-item ${location.pathname === "/users" ? "nav-item-active" : ""}`}
//       >
//         <button
//           type="button"
//           className="nav-link active"
//           onClick={() => navigate({ to: `/users?q=${value}` })}
//         >
//           Użytkownicy
//         </button>
//       </li>
//       <li
//         className={`nav-item ${location.pathname === "/communities" ? "nav-item-active" : ""}`}
//       >
//         <button
//           type="button"
//           className="nav-link active"
//           onClick={() => navigate({ to: `/communities?q=${value}` })}
//         >
//           Społeczności
//         </button>
//       </li>
//     </ul>
//   );
// };

export default function LoggedInNavbar({ logOut, navigate, isHeroPage }) {
  const [rotated, setRotated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const modalRef = useRef();
  const mobileMenuRef = useRef(null);

  const auth = useAuth();
   const {user}=useAuth();
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
      // Sprawdź, czy kliknięcie jest poza desktopowym menu
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setRotated(false);
      }
      // Sprawdź, czy kliknięcie jest poza mobilnym menu
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <SearchInput />
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
            <div className="dropdown-menu-profile" ref={mobileMenuRef}>
              <ul className="dropdown-menu-list">
                <li className="dropdown-menu-item dropdown-menu-username">
                  {auth.user.userName}
                </li>
                <li className="dropdown-menu-item" onClick={() => {
                  navigate({ to: `/users/${user.id}` });
                  setMobileMenuOpen(false);
                }} >Profil</li>
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
        {/* Dropdown na desktopie */}
        {rotated && (
          <div className="dropdown-menu-profile" ref={modalRef}>
            <ul className="dropdown-menu-list">
              <li className="dropdown-menu-item dropdown-menu-username">
                {auth.user.userName}
              </li>
              <li className="dropdown-menu-item" onClick={() => {
                  navigate({ to: `/users/${user.id}` });
                  setMobileMenuOpen(false);
                }}  >Profil</li>
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
      {/* <SearchSections value={searchValue} isSearchingPosts={isSearchingPosts} /> */}
    </nav>
  );
}
