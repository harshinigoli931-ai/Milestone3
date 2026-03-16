import Login from "./Login";
import Register from "./Register";
import Landing_page from "./Landing_page";

export default function App() {
  const path = window.location.pathname;

  if (path === "/login") return <Login />;
  if (path === "/register") return <Register />;

  return <Landing_page />;
}
