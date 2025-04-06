// App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProjectDetails from "./pages/ProjectDetails"; // 👈 NEW
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import NoAccess from "./pages/NoAccess";
import { SearchProvider } from "./context/SearchContext";
import { useTheme } from "./context/ThemeContext";
import ManageEmployees from "./pages/ManageEmployees";

// ... your imports

const AppLayout = ({ children }) => {
  const { theme } = useTheme();
  return (
    <div className={`${theme} h-screen`}>
      <div className="relative h-full bg-[#f7f7fa] text-[#1b0f34] dark:bg-[#0e0e1a] dark:text-white overflow-hidden">
        <div className="fixed top-0 left-0 h-full w-20 z-10">
          <Sidebar />
        </div>
        <div className="ml-20 h-full flex flex-col overflow-y-auto">
          <Header />
          <div className="flex-1 px-6 py-4 overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route path="/login" element={<Login key={location.key} />} />
      <Route
        path="/"
        element={
          token ? (
            <AppLayout>
              <Dashboard />
            </AppLayout>
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/projects/:sowId"
        element={
          token ? (
            <AppLayout>
              <ProjectDetails />
            </AppLayout>
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/manage-employees"
        element={
          token ? (
            <AppLayout>
              <ManageEmployees />
            </AppLayout>
          ) : (
            <Login />
          )
        }
      />
      <Route path="/no-access" element={<NoAccess />} />
    </Routes>
  );
};

// ✅ Define the App component
function App() {
  return (
    <SearchProvider>
      <Router>
        <AppRoutes />
      </Router>
    </SearchProvider>
  );
}

// ✅ Now this line will work
export default App;
