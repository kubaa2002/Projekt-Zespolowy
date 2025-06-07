import { createFileRoute } from '@tanstack/react-router'

import Hidden from '../components/post/Hidden'
import MainLayout from '../components/main/MainLayout'

export const Route = createFileRoute('/post')({
  component: RouteComponent,
})

function RouteComponent() {
  return <MainLayout> 
    <Hidden />
  </MainLayout>
}
