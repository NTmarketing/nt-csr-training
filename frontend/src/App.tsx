import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Admin from './pages/Admin';
import Certificate from './pages/Certificate';
import Dashboard from './pages/Dashboard';
import FinalExam from './pages/FinalExam';
import Login from './pages/Login';
import Module from './pages/Module';
import QuizPage from './pages/QuizPage';
import Roleplay from './pages/Roleplay';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="module/:id" element={<Module />} />
        <Route path="module/:id/quiz" element={<QuizPage />} />
        <Route path="module/:id/scenario/:scenarioId" element={<Roleplay />} />
        <Route path="exam" element={<FinalExam />} />
        <Route path="certificate" element={<Certificate />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute requireAdmin>
              <Admin />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
