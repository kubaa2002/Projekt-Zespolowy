export default function LoggedOutNavbar({ navigate, isHeroPage }) {
  return (
  <nav className={`navbar ${isHeroPage ? "" : "navbar-main"}`}>
    <div className="left-sidebar" style={{ visibility: isHeroPage ? "hidden" : "visible" }}>
      <div className="headline-navbar-title">
        <i className="bi bi-heart me-2"></i>
        Vibe
      </div>
      <div className="navbar-subtitle">We absolutely do not copy reddit</div>
    </div>
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
  </nav>
  );
}