import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'

// Each page loads only when it is opened, so the first screen appears faster.
const Landing = lazy(() => import('./pages/Landing'))
const Live = lazy(() => import('./pages/Live'))
const Farmer = lazy(() => import('./pages/Farmer'))
const Buyer = lazy(() => import('./pages/Buyer'))
const AgentPage = lazy(() => import('./pages/Agent'))
const Impact = lazy(() => import('./pages/Impact'))

const Loading = () => (
  <div className="flex h-[60vh] items-center justify-center">
    <div className="h-9 w-9 animate-spin rounded-full border-4 border-sage border-t-forest" />
  </div>
)

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/live" element={<Live />} />
          <Route path="/farmer" element={<Farmer />} />
          <Route path="/buyer" element={<Buyer />} />
          <Route path="/agent" element={<AgentPage />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  )
}
