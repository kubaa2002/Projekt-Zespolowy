import { createFileRoute } from '@tanstack/react-router'
import SearchProfile from "../../components/profilesLayouts/searchProfile.jsx";
export const Route = createFileRoute('/users/following')({
  component: RouteComponent,
})
// todo
function RouteComponent() {
  return <div>Hello "/users/following"!</div>
}
