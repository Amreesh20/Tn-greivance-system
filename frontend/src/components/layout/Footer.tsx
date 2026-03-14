// src/components/layout/Footer.tsx
import { Link } from "react-router-dom"
import { Phone, Mail, MapPin, Facebook, Twitter, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              TN Grievance Portal
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              An AI-powered grievance redressal system for Tamil Nadu citizens.
              Submit, track, and resolve complaints efficiently.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/submit" className="hover:text-white transition-colors">
                  Submit Complaint
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-white transition-colors">
                  Track Complaint
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Guidelines
                </a>
              </li>
            </ul>
          </div>

          {/* Government Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Government
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://www.tn.gov.in" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Tamil Nadu Government
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  District Administration
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Accessibility
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Helpline</p>
                  <p>1800-123-4567</p>
                  <p className="text-xs text-gray-400">Mon-Sat, 9 AM - 6 PM</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Email</p>
                  <p>grievance@tngov.in</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-white">Address</p>
                  <p>Fort St. George, Chennai</p>
                  <p>Tamil Nadu - 600009</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>
            © {new Date().getFullYear()} Government of Tamil Nadu. All rights reserved.
          </p>
          <p className="text-gray-500 mt-2">
            Last updated: {new Date().toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
    </footer>
  )
}
