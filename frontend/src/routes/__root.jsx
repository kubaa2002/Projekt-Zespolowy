import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
export const Route = createRootRoute({
  component: () => (
    <>
      <nav>
        <div className="nav-link-list">
          <Link
            to="/"
            activeProps={{
              style: {
                color: "rgb(255, 0, 234)",
              },
            }}
          >
            Home
          </Link>
          <Link
            to="/posts"
            activeProps={{
              style: {
                color: "rgb(255, 0, 234)",
              },
            }}
          >
            Posts
          </Link>
          <Link
            to="/login"
            activeProps={{
              style: {
                color: "rgb(255, 0, 234)",
              },
            }}
          >
            Login
          </Link>
          <Link
            to="/signup"
            activeProps={{
              style: {
                color: "rgb(255, 0, 234)",
              },
            }}
          >
            Signup
          </Link>
        </div>
      </nav>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
