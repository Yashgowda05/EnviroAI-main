import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import AIAssistant from "./pages/AIAssistant";
import RoutePlanner from "./pages/RoutePlanner";
import Statistics from "./pages/Statistics";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<Landing />} />

      {/* Authentication Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Profile Page */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Protected AI Assistant */}
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <AIAssistant />
          </ProtectedRoute>
        }
      />

      {/* Protected Statistics Page */}
      <Route
        path="/statistics"
        element={
          <ProtectedRoute>
            <Statistics />
          </ProtectedRoute>
        }
      />

      {/* Protected Route Planner */}
      <Route
        path="/route"
        element={
          <ProtectedRoute>
            <RoutePlanner />
          </ProtectedRoute>
        }
      />

      {/* Page Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;