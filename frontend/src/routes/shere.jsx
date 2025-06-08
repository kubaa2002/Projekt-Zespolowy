import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/shere')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/shere"!</div>
}
