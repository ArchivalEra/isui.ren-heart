import { Navigate, Route, Routes } from 'react-router-dom'
import Heart from './pages/Heart'
import Home from './pages/Home'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/heart" replace />} />
      <Route path="/heart" element={<Heart />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/heart" replace />} />
    </Routes>
  )
}
