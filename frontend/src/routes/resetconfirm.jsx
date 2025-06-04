import { createFileRoute } from '@tanstack/react-router'
import PassResset2 from '../components/authForms/PassResset2'

export const Route = createFileRoute('/resetconfirm')({
  component: RouteComponent,
})

function RouteComponent() {
  return <PassResset2 />
}
