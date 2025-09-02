import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import GoogleLogin from "./components/google-login";
import Hero from "./components/hero";
import PageNotFound from "./components/page-not-found";
import Dashboard from "./components/dashboard";
import ErrorBoundary from "./components/page-not-found";
import ProtectedRoute from "./components/protected-route";
import DashboardPageMe from "./components/dashboard-me";
import ControlRoom from "./components/dashboard-feature/admin/control-room";
import ProtectedAdminRoute from "./components/dashboard-feature/protedted-admin-route";
import LeaveRequests from "./components/leave-requests";
import ProtectedManagerRoute from "./components/dashboard-feature/protedted-manager-route";
import ManageLeaveRequests from "./components/manager/manage-leave-request";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Hero />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/login",
    element: <GoogleLogin />,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "me",
        element: <DashboardPageMe />,
      },
      {
        path: "admin",

        element: (
          <ProtectedAdminRoute>
            <ControlRoom />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: "leave-requests",
        element: <LeaveRequests />,
      },
      {
        path: "manage-leave-requests",
        element: (
          <ProtectedManagerRoute>
            <ManageLeaveRequests />
          </ProtectedManagerRoute>
        ),
      },
    ],
    errorElement: <PageNotFound />,
  },
  {
    path: "*",
    element: <PageNotFound />,
    errorElement: <ErrorBoundary />,
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
