import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TicketProvider from "./context/TicketContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Movies from "./pages/MoviesList";
import AdminLayout from "./pages/staff/admin/AdminLayout";
import AdminOverview from "./pages/staff/admin/AdminOverview";
import ManagerLayout from "./pages/staff/manager/ManagerLayout";
import ShowBoard from "./pages/staff/manager/ShowBoard";
import TheatreBoard from "./pages/staff/manager/TheatreBoard";
import { Section } from "./pages/staff/Section";
import { MovieEditor, TheatreEditor, UserEditor } from "./pages/staff/Editors";
import MoviesTab from "./pages/staff/MoviesTab";
import TheatresTab from "./pages/staff/TheatresTab";
import BookingsTab from "./pages/staff/BookingsTab";
import UsersTab from "./pages/staff/UsersTab";
import MovieInsight from "./pages/staff/detail/MovieInsight";
import TheatreInsight from "./pages/staff/detail/TheatreInsight";
import BookingInsight from "./pages/staff/detail/BookingInsight";
import UserInsight from "./pages/staff/detail/UserInsight";
import TicketBooked from "./pages/TicketBooked";
import SeatSelection from "./pages/SeatSelection";
import Confirmation from "./pages/Confirmation";
import ETicket from "./pages/ETicket";
import NotFound from "./pages/NotFound";
import MovieDetails from "./pages/MovieDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import AccountLayout from "./pages/account/AccountLayout";
import MyBookings from "./pages/account/MyBookings";
import BookingDetails from "./pages/account/BookingDetails";
import Profile from "./pages/account/Profile";
import Security from "./pages/account/Security";

import "./styles/App.css";

function App() {
  return (
      <TicketProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Auth />} />
                <Route path="/register" element={<Auth />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/movie/:id" element={<MovieDetails />} />

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["Admin"]}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Section component={AdminOverview} />} />
                  <Route path="users" element={<Section title="Users" sub="Everyone with a CineBook account. Open a user to see their profile, spending and bookings." component={UsersTab} />} />
                  <Route path="users/new" element={<Section component={UserEditor} />} />
                  <Route path="users/:id" element={<Section component={UserInsight} />} />
                  <Route path="users/:id/edit" element={<Section component={UserEditor} />} />
                  <Route path="movies" element={<Section title="Movies" sub="Every show on sale. Open one for its seat map, bookings and revenue." component={MoviesTab} />} />
                  <Route path="movies/new" element={<Section component={MovieEditor} />} />
                  <Route path="movies/:id" element={<Section component={MovieInsight} />} />
                  <Route path="movies/:id/edit" element={<Section component={MovieEditor} />} />
                  <Route path="theatres" element={<Section title="Theatres" sub="Venues that shows can be scheduled at." component={TheatresTab} />} />
                  <Route path="theatres/new" element={<Section component={TheatreEditor} />} />
                  <Route path="theatres/:id" element={<Section component={TheatreInsight} />} />
                  <Route path="theatres/:id/edit" element={<Section component={TheatreEditor} />} />
                  <Route path="bookings" element={<Section title="Bookings" sub="Every ticket sold. Open one to see the customer, show and seats." component={BookingsTab} />} />
                  <Route path="bookings/:id" element={<Section component={BookingInsight} />} />
                </Route>
                <Route
                  path="/manager"
                  element={
                    <ProtectedRoute allowedRoles={["Manager"]}>
                      <ManagerLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Section component={ShowBoard} />} />
                  <Route path="movies/new" element={<Section component={MovieEditor} />} />
                  <Route path="movies/:id" element={<Section component={MovieInsight} />} />
                  <Route path="movies/:id/edit" element={<Section component={MovieEditor} />} />
                  <Route path="theatres" element={<Section component={TheatreBoard} />} />
                  <Route path="theatres/new" element={<Section component={TheatreEditor} />} />
                  <Route path="theatres/:id" element={<Section component={TheatreInsight} />} />
                  <Route path="theatres/:id/edit" element={<Section component={TheatreEditor} />} />
                  <Route path="bookings" element={<Section component={BookingsTab} />} />
                  <Route path="bookings/:id" element={<Section component={BookingInsight} />} />
                </Route>
                <Route
                  path="/seat-selection"
                  element={
                    <ProtectedRoute allowedRoles={["User", "Manager", "Admin"]}>
                      <SeatSelection />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/ticket-booked"
                  element={
                    <ProtectedRoute allowedRoles={["User", "Manager", "Admin"]}>
                      <TicketBooked />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/confirmation"
                  element={
                    <ProtectedRoute allowedRoles={["User", "Manager", "Admin"]}>
                      <Confirmation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/eticket"
                  element={
                    <ProtectedRoute allowedRoles={["User", "Manager", "Admin"]}>
                      <ETicket />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute allowedRoles={["User", "Manager", "Admin"]}>
                      <AccountLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="bookings" replace />} />
                  <Route path="bookings" element={<MyBookings />} />
                  <Route path="bookings/:id" element={<BookingDetails />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="security" element={<Security />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </Router>
      </TicketProvider>
  );
}

export default App;
