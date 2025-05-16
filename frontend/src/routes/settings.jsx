import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h2>Settings page</h2>

      </div>
    </div>
  )
}
