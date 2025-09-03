import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import TicketProvider from "./context/TicketContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Movies from "./pages/MoviesList";
import AdminPanel from "./pages/AdminPanel";
import ManagerPanel from "./pages/ManagerPanel";
import TicketBooked from "./pages/TicketBooked";
import SeatSelection from "./pages/SeatSelection";
import Confirmation from "./pages/Confirmation";
import ETicket from "./pages/ETicket";
import ProtectedRoute from "./components/ProtectedRoute";

import "./styles/App.css";

function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/movies" element={<Movies />} />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manager"
                  element={
                    <ProtectedRoute allowedRoles={["Manager"]}>
                      <ManagerPanel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/seat-selection"
                  element={
                    <ProtectedRoute allowedRoles={["User"]}>
                      <SeatSelection />
                    </ProtectedRoute>
                  }
                />
                
                <Route
                  path="/ticket-booked"
                  element={
                    <ProtectedRoute allowedRoles={["User"]}>
                      <TicketBooked />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/confirmation"
                  element={
                    <ProtectedRoute allowedRoles={["User"]}>
                      <Confirmation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/eticket"
                  element={
                    <ProtectedRoute allowedRoles={["User"]}>
                      <ETicket />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </Router>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;
