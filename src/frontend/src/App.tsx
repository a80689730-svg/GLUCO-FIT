import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import Admin from "./pages/Admin";
import Chat from "./pages/Chat";
import Dashboard from "./pages/Dashboard";
import Diet from "./pages/Diet";
import Doctors from "./pages/Doctors";
import Exercise from "./pages/Exercise";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Plans from "./pages/Plans";
import Shopping from "./pages/Shopping";

// Root route with Layout wrapper
const rootRoute = createRootRoute({
  component: Layout,
});

// Home page
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const dietRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/diet",
  component: Diet,
});

const doctorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/doctors",
  component: Doctors,
});

const plansRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/plans",
  component: Plans,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: Admin,
});

const shoppingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shopping",
  component: Shopping,
});

const exerciseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/exercise",
  component: Exercise,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: Chat,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: Dashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dietRoute,
  doctorsRoute,
  plansRoute,
  adminRoute,
  shoppingRoute,
  exerciseRoute,
  chatRoute,
  dashboardRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
