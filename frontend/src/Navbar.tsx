import { Link, useLocation } from 'react-router-dom'

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Athletes', path: '/athletes' },
  { name: 'Results', path: '/results' },
  { name: 'Top Times', path: '/top-times' },
]

function NavLinks() {
  const location = useLocation()

  return (
    <div className="flex items-center gap-1" role="navigation" aria-label="Main menu">
      {navLinks.map((link) => {
        const isActive = location.pathname === link.path
        return (
          <Link
            key={link.name}
            to={link.path}
            tabIndex={0}
            className={`block px-4 py-2 rounded-lg transition-colors font-semibold focus:ring-2 focus:ring-[#16a34a] focus:ring-offset-2 focus:outline-none ${
              isActive
                ? 'bg-[#16a34a] text-white'
                : 'text-gray-700 hover:bg-[#16a34a]/10 hover:text-[#16a34a]'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {link.name}
          </Link>
        )
      })}
    </div>
  )
}

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            aria-label="Jones County Cross Country - Home"
            tabIndex={0}
            className="flex items-center gap-2 focus:ring-2 focus:ring-[#16a34a] focus:ring-offset-2 focus:outline-none rounded-lg p-1"
          >
            <div className="flex flex-col leading-tight" aria-hidden="true">
              <span className="font-extrabold text-[#16a34a] text-lg tracking-tight">JONES COUNTY</span>
              <span className="text-xs font-semibold text-gray-500 tracking-widest">CROSS COUNTRY</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <NavLinks />
        </div>
      </div>
    </nav>
  )
}
