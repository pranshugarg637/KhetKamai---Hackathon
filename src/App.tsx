import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Live from './pages/Live'
import Farmer from './pages/Farmer'
import Buyer from './pages/Buyer'
import AgentPage from './pages/Agent'
import Impact from './pages/Impact'

export default function App() {
  return (
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
  )
}
