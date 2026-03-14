// src/components/layout/Header.tsx
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Menu, X, Phone, Search } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-tn-blue flex items-center justify-center">
              <span className="text-white font-bold text-xl">TN</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-tn-blue">
                TN Grievance Portal
              </h1>
              <p className="text-xs text-gray-600">
                Tamil Nadu Government
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-tn-blue transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              to="/submit"
              className="text-gray-700 hover:text-tn-blue transition-colors font-medium"
            >
              Submit Complaint
            </Link>
            <Link
              to="/track"
              className="text-gray-700 hover:text-tn-blue transition-colors font-medium flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              Track Complaint
            </Link>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:1800-123-4567" className="flex items-center gap-2 text-gray-700 hover:text-tn-blue">
              <Phone className="h-4 w-4" />
              <span className="text-sm">1800-123-4567</span>
            </a>
            <Button onClick={() => navigate('/submit')}>
              Register Complaint
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t">
            <Link
              to="/"
              className="block py-2 text-gray-700 hover:text-tn-blue"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/submit"
              className="block py-2 text-gray-700 hover:text-tn-blue"
              onClick={() => setMobileMenuOpen(false)}
            >
              Submit Complaint
            </Link>
            <Link
              to="/track"
              className="block py-2 text-gray-700 hover:text-tn-blue"
              onClick={() => setMobileMenuOpen(false)}
            >
              Track Complaint
            </Link>
            <div className="pt-4 border-t">
              <a href="tel:1800-123-4567" className="flex items-center gap-2 text-gray-700 py-2">
                <Phone className="h-4 w-4" />
                <span>1800-123-4567</span>
              </a>
              <Button 
                className="w-full mt-2" 
                onClick={() => {
                  navigate('/submit')
                  setMobileMenuOpen(false)
                }}
              >
                Register Complaint
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
