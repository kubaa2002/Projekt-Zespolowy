import { createFileRoute } from '@tanstack/react-router'
import PassReset from '../components/authForms/PassReset'

export const Route = createFileRoute('/reset')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PassReset />
}
