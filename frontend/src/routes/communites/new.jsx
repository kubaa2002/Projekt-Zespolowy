import { createFileRoute } from '@tanstack/react-router'
import ProtectedRoute from "../../utils/ProtectedRoute.jsx";
import NewCommunity from '../../components/communities/NewCommunity.jsx';
export const Route = createFileRoute('/communites/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProtectedRoute><NewCommunity/></ProtectedRoute>
}
