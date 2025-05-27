import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import MainLayout from "../main/MainLayout";

export default function Create() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const type = params.get("type");

    useEffect(() => {
        if (!type) {
            navigate("/create?type=post", { replace: true });
        }
    }, [type, navigate]);

    return(
        <MainLayout centered>
            <div className="centered-container">
                <div className="create-container">
                    {type === "post" && (
                        <div>
                            <h2>Nowy post</h2>
                            {/* Formularz posta */}
                        </div>
                    )}
                    {type === "community" && (
                        <div>
                            <h2>Stwórz społeczność</h2>
                            {/* Formularz społeczności */}
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
}