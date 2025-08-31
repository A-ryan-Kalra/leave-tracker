import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import GoogleLogin from "./components/google-login";
import Hero from "./components/hero";
import PageNotFound from "./components/page-not-found";
import Dashboard from "./components/dashboard";
import ErrorBoundary from "./components/page-not-found";
import ProtectedRoute from "./components/protected-route";

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
