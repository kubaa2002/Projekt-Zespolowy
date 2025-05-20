import { createFileRoute } from '@tanstack/react-router'
import Create from '../components/create/Create.jsx';

export const Route = createFileRoute('/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Create/>
}