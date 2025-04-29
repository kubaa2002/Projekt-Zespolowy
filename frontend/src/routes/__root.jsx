import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
  component: () => (
    <>
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
      </nav>
      <main>
        <Outlet/>
      </main>
      <TanStackRouterDevtools />
    </>
  ),
});