import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/communites/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/communites"!</div>
}
