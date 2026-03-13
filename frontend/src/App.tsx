import BooksPage from "./pages/BooksPage";
import DashboardPage from "./pages/DashboardPage";
import { Routes, Route, Navigate } from "react-router-dom"
import Appshell from "./components/templates/DashboardLayout/AppShell";
import BookDetailsPage from "./pages/BookDetailedPage";
import AddBookPage from "./components/molecules/SearchBar/AddBookPage";
import UsersPage from "./pages/UserPage";
import AddUserPage from "./pages/AddUserPage";
import FineDetailsPage from "./pages/FineDetailsPage";
import IssueReturnPage from "./pages/IssuePage";
import StatusPage from "./pages/StatusPage";
import ReservationsPage from "./pages/ReservationsPage";
import LoginPage from "./pages/LoginPage";
import UserDashboardPage from "./pages/UserDashboardPage";
import UserBooksPage from "./pages/UserBooksPage";
import UserBookDetailsPage from "./pages/UserBookDetailsPage";
import UserDetailsPage from "./pages/UserDetailsPage";
import UserAppShell from "./components/templates/UserLayout/UserAppShell";
import ProfilePage from "./pages/ProfilePage";


function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/user" element={<UserAppShell />}>
        <Route index element={<Navigate to="/user/dashboard" replace />} />
        <Route path="dashboard" element={<UserDashboardPage />} />
        <Route path="books" element={<UserBooksPage />} />
        <Route path="books/:id" element={<UserBookDetailsPage />} />
        <Route path="status" element={<StatusPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      <Route element={<Appshell />}>
        <Route index element={<Navigate to="/login" replace />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/profile" element={<ProfilePage />} />
        <Route path="/admin/fines" element={<FineDetailsPage />} />
        <Route path="/admin/reservations" element={<ReservationsPage />} />
        <Route path="/admin/books" element={<BooksPage />} />
        <Route path="/admin/books/:id" element={<BookDetailsPage />} />
        <Route path="/admin/add-book" element={<AddBookPage />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/users" element={<UsersPage />} />
        <Route path="/admin/users/:id" element={<UserDetailsPage />} />
        <Route path="/admin/add-user" element={<AddUserPage/>}/>
        <Route path="/admin/issues" element={<IssueReturnPage/>}/>
      </Route>

    </Routes>
  );
}

export default App;
