import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "../../contexts/authProvider";
import LoggedInNavbar from "./LoggedInNavbar";
import LoggedOutNavbar from "./LoggedOutNavbar";

export default function Navbar() {
  const location = useLocation();
  const isHeroPage = location.pathname === "/hero";
  const navigate = useNavigate();
  const { logOut, token } = useAuth();
  useEffect(() => {
    document.body.className = isHeroPage ? "" : "hero-page";
  }, [isHeroPage]);

  return token ? (
    <LoggedInNavbar
      logOut={logOut}
      navigate={navigate}
      isHeroPage={isHeroPage}
    />
  ) : (
    <LoggedOutNavbar navigate={navigate} isHeroPage={isHeroPage} />
  );
}
