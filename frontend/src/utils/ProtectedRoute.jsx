import { useEffect } from "react";
import { useAuth } from "../contexts/authProvider";
import { useNavigate } from "@tanstack/react-router";
function ProtectedRoute({ children }) {
    const navigate = useNavigate();
    const auth = useAuth();
    useEffect(() => {
        if (!auth.token) {
            navigate({ to: "/login" });
        }
    }, [auth.token, navigate]);
    
    return <>{children}</>;
}
export default ProtectedRoute;