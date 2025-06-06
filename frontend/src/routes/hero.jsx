import { createFileRoute } from "@tanstack/react-router";
import Hero from '../components/hero/Hero.jsx';

export const Route = createFileRoute("/hero")({
    component: RouteComponent,
});

function RouteComponent() {
    return <Hero />
}