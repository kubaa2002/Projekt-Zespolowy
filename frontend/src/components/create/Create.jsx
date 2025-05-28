import { useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import MainLayout from "../main/MainLayout";
import MainModal from "../modals/MainModal";

export default function Create() {
    const location = useLocation();
    const navigate = useNavigate();
    const params = new URLSearchParams(location.search);
    const maxLength = 2000;
    const [postContent, setPostContent] = useState("");
    const [communityContent, setCommunityContent] = useState("");
    const [postFile, setPostFile] = useState(null);
    const [communityFile, setCommunityFile] = useState(null);
    const fileInputRef = useRef(null);
    const type = params.get("type");

    const handleFileChange = (e) => {
        if (type === "post") setPostFile(e.target.files[0]);
        else setCommunityFile(e.target.files[0]);
    };

    const handleRemove = () => {
        if (type === "post") setPostFile(null);
        else setCommunityFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

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
                        <MainModal
                        show={true}
                        onClose={() => setRotated(false)}
                        maxLength={maxLength}
                        content={postContent}
                        setContent={setPostContent}
                        file={postFile}
                        handleFileChange={handleFileChange}
                        handleRemove={handleRemove}
                        fileInputRef={fileInputRef}
                        />
                    )}
                    {type === "community" && (
                        <MainModal
                        show={true}
                        onClose={() => setRotated(false)}
                        maxLength={maxLength}
                        content={communityContent}
                        setContent={setCommunityContent}
                        file={communityFile}
                        handleFileChange={handleFileChange}
                        handleRemove={handleRemove}
                        fileInputRef={fileInputRef}
                        hideSelect={true}
                        />
                    )}
                </div>
            </div>
        </MainLayout>
    );
}