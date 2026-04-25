import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

// TODO: import all page components here

function App() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />
      <main className="pt-16">
        <Routes>
          {/* TODO: define all routes here */}
        </Routes>
      </main>
    </div>
  )
}

export default App
