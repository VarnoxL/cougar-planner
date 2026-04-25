import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CourseDetailPage from './pages/CourseDetailPage'
import CoursesPage from './pages/CoursesPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import MySchedulesPage from './pages/MySchedulesPage'
import ProfessorDetailPage from './pages/ProfessorDetailPage'
import ProfessorsPage from './pages/ProfessorsPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import ScheduleBuilderPage from './pages/ScheduleBuilderPage'

function App() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/professors" element={<ProfessorsPage />} />
          <Route path="/professors/:id" element={<ProfessorDetailPage />} />
          <Route path="/schedules" element={<MySchedulesPage />} />
          <Route path="/schedules/:id" element={<ScheduleBuilderPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
