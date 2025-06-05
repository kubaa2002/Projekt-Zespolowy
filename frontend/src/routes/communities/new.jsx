import { createFileRoute } from '@tanstack/react-router'
import ProtectedRoute from "../../utils/ProtectedRoute.jsx";
import NewCommunity from '../../components/communities/NewCommunity.jsx';
import MainLayout from '../../components/main/MainLayout.jsx';
export const Route = createFileRoute('/communities/new')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProtectedRoute><MainLayout><NewCommunity/></MainLayout></ProtectedRoute>
}
