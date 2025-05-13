import SearchInput from "../primitives/SearchInput";
import { useState } from "react";

export default function LoggedInNavbar({ logOut, navigate, isHeroPage }) {
  const [rotated, setRotated] = useState(false);

  return (
  <nav className={`d-flex justify-content-between align-items-center navbar ${isHeroPage ? "" : "navbar-main"}`}>
    <div className="left-sidebar" style={{ visibility: isHeroPage ? "hidden" : "visible" }}>
      <div className="headline-navbar-title">
        <i className="bi bi-heart me-2"></i>
        Vibe
      </div>
      <div className="navbar-subtitle">We absoluty do not copy reddit</div>
    </div>
    <div className="d-flex" style={{ gap: "0px" }}>
      <SearchInput />
      <button className="btn btn-primary btn-register btn-register-post">
        <i className="bi bi-plus-circle me-2"></i>
        Nowy post
      </button>
      {/*<button
        className="btn btn-danger"
        onClick={() => {
          logOut();
          navigate({ to: "/login" });
        }}
      >
        Wyloguj
      </button>*/}
      <div className="notification-icon">
        <i className="bi bi-bell-fill"></i>
        <img
          src="elipse.svg"
          alt="Elipse"
          className="elipse"
        />
      </div>
      <div className="profile">
        <img src="avatar.svg" alt="Avatar"/>
        <i className="bi bi-triangle-fill"
        style={{
          transform: rotated ? "rotate(0deg)" : "rotate(180deg)",
          color: "black",
          cursor: "pointer",
        }} 
        onClick={() => setRotated((r) => !r)}></i>
      </div>
    </div>
  </nav>
  );
}