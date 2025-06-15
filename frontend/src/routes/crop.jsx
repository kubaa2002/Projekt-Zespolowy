import { createFileRoute } from "@tanstack/react-router";
import ImageCrop from "../components/modals/ImageCrop";
export const Route = createFileRoute("/crop")({
    component: RouteComponent,
});

function RouteComponent() {
    return <ImageCrop />
}