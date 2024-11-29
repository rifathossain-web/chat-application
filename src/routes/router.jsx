import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/Main";
import Airstate from "../pages/Airstate";
import AlHeli from "../pages/alHeli";
import ErrorPage from "../pages/errorPage";
import UpdateStateForm from "../pages/UpdateSateForm";
import HeliDetails from "../pages/HeliDatails";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    errorElement: <ErrorPage />,  // Universal error handling
    children: [
      {
        path: "airstate",
        element: <Airstate />,
      },
      {
        path:"updatestate",
        element:<UpdateStateForm></UpdateStateForm>

      },
      {
        path:"heli",
        element:<AlHeli></AlHeli>
      },
      {
        path: "helidetails/:id", // Dynamic routing for individual helicopter details
        element: <HeliDetails />,
      },
      
    ],
  },
]);
