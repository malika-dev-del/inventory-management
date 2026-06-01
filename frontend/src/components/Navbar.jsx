import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>Inventory</span> &amp; Orders
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📦</span> Products
        </NavLink>
        <NavLink to="/customers" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">👥</span> Customers
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🛒</span> Orders
        </NavLink>
      </nav>
    </aside>
  )
}
