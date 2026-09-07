import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isInterviewer = user && user.role === "INTERVIEWER";

  const linkClass = ({ isActive }) =>
    `nav-link${isActive ? " nav-link-active" : ""}`;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <span className="app-brand">Technical Interview System</span>
          <nav className="app-nav">
            {isInterviewer && (
              <>
                <NavLink to="/interviewer/dashboard" className={linkClass}>Dashboard</NavLink>
                <NavLink to="/interviewer/users" className={linkClass}>Users</NavLink>
                <NavLink to="/interviewer/candidates" className={linkClass}>Candidates</NavLink>
                <NavLink to="/interviewer/scores" className={linkClass}>Scores</NavLink>
                <NavLink to="/interviewer/questions" className={linkClass}>Question Bank</NavLink>
              </>
            )}
            {!isInterviewer && user && (
              <NavLink to="/candidate/dashboard" className={linkClass}>Dashboard</NavLink>
            )}
          </nav>
          <div className="app-user">
            <span className="app-user-name">{user?.fullName}</span>
            <span className={`role-badge role-${user?.role}`}>{user?.role}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>
      <main className="app-main">
        {children !== undefined ? children : <Outlet />}
      </main>
    </div>
  );
}