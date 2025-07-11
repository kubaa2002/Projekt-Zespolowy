import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Navbar from "../components/navbar/Navbar";
import CookieGDPRConsent from "../components/popups/cookieGDPR";

export const Route = createRootRoute({
  component: rootComponent,
});

function rootComponent() {
  return (
    <div className="root-container">
      <Navbar />
      <Outlet />
      <CookieGDPRConsent />
      <TanStackRouterDevtools />
    </div>
  );
}