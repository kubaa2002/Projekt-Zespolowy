import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Navbar from "../components/navbar/Navbar";

export const Route = createRootRoute({
  component: rootComponent,
});

function rootComponent() {
  return (
    <div className="root-container">
      <Navbar />
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  );
}