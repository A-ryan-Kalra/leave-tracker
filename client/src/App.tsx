import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello World</div>,
  },
  {
    path: "/hello",
    element: <div>Hello </div>,
  },
]);
function App() {
  return <RouterProvider router={router} />;
}

export default App;
