import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="centered-container">
      <div className="form-container">
          <h2>Settings page</h2>
      </div>
    </div>
  )
}
