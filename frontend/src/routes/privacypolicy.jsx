import { createFileRoute } from '@tanstack/react-router'
import PrivacyPolicy from '../components/privacyPolicy/PrivacyPolicy.jsx'
export const Route = createFileRoute('/privacypolicy')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PrivacyPolicy />;
}
