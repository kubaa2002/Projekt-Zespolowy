import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../../contexts/authProvider";
import LoggedInNavbar from "./LoggedInNavbar";
import LoggedOutNavbar from "./LoggedOutNavbar";

export default function Navbar() {
  const location = useLocation();
  const isHeroPage = location.pathname === "/hero";
  const navigate = useNavigate();
  const {logOut, token, isAuthenticated} = useAuth();
  // I think we should create 2 navbars. One for each state loggedin/loggedout. Now the add Post button is visible on the hero page
  useEffect(() => {
    document.body.className = isHeroPage ? "" : "hero-page";
  }, [isHeroPage]);

  useEffect(() => {
     (async () => {
       const ok = await isAuthenticated();
       if (!ok) {
         navigate({ to: "/hero" });
      }
    })();
  }, [isAuthenticated, navigate, token]);
  
  return token ? (
    <LoggedInNavbar logOut={logOut} navigate={navigate} isHeroPage={isHeroPage} />
  ) : (
    <LoggedOutNavbar navigate={navigate} isHeroPage={isHeroPage} />
  );
}
