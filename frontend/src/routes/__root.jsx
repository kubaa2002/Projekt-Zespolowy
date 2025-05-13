import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Navbar from "../components/navbar/Navbar";

export const Route = createRootRoute({
  // TODO: This is maybe embarrassing, but I don't know any other way to do it
  beforeLoad: async ({ location }) => {
    const token = localStorage.getItem("token");
    const publicRoutes = ["/hero", "/login", "/signup"];

    if (token && publicRoutes.includes(location.pathname)) {
      throw redirect({ to: "/" });
    }
  },
  component: rootComponent,
});

function rootComponent() {
  return (
    <div className="root-container">
      <Navbar />
      <div className="centered-container">
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </div>
  );
}