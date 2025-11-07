import HomePage from "../pages/Home/Home.jsx";
import WorkersPage from "../pages/Workers/Workers.jsx";
import BoxesPage from "../pages/Boxes/Boxes.jsx";
import BookingsPage from "../pages/Bookings/Bookings.jsx";
import SalaryPage from "../pages/Salary/Salary.jsx";

const routes = [
  { path: "/", element: HomePage },
  { path: "/workers", element: WorkersPage },
  { path: "/boxes", element: BoxesPage },
  { path: "/bookings", element: BookingsPage },
  { path: "/salary", element: SalaryPage },
];

export default routes;


