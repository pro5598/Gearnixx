import { useNavigate } from "react-router-dom";
import { Mail, MapPin, Phone, Gamepad2, Shield, Truck, Headphones } from "lucide-react";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Gamepad2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                GEARNIX
              </h3>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm">
              Premium gaming accessories designed for champions. Level up your gaming experience with our professional-grade gear trusted by esports pros worldwide.
            </p>
            <div className="flex space-x-4 pt-2">
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">50K+</div>
                <div className="text-xs text-gray-500">Gamers</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">1000+</div>
                <div className="text-xs text-gray-500">Products</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">98%</div>
                <div className="text-xs text-gray-500">Satisfaction</div>
              </div>
            </div>
          </div>

          {/* Shop Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Shop Categories</h4>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/category/mice")}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Gaming Mice
              </button>
              <button
                onClick={() => navigate("/category/keyboards")}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Mechanical Keyboards
              </button>
              <button
                onClick={() => navigate("/category/headsets")}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Gaming Headsets
              </button>
              <button
                onClick={() => navigate("/category/controllers")}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Controllers
              </button>
              <button
                onClick={() => navigate("/category/accessories")}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Gaming Accessories
              </button>
            </div>
          </div>

          {/* Customer Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Customer Support</h4>
            <div className="space-y-2">
              <button
                onClick={() => navigate("/account")}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                My Account
              </button>
              <button
                onClick={() => navigate("/orders")}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Track Orders
              </button>
              <button
                onClick={() => navigate("/support")}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Help Center
              </button>
              <button
                onClick={() => navigate("/warranty")}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Warranty
              </button>
              <button
                onClick={() => navigate("/returns")}
                className="block text-gray-400 hover:text-purple-400 transition-colors text-sm"
              >
                Returns & Exchanges
              </button>
            </div>
          </div>

          {/* Contact & Features */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Get in Touch</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="h-4 w-4 text-purple-400" />
                <span className="text-sm">support@gearnix.com</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="h-4 w-4 text-purple-400" />
                <span className="text-sm">+1 (555) 123-GAME</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span className="text-sm">Gaming District, Tech City</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center space-x-2 text-gray-400">
                <Truck className="h-4 w-4 text-green-400" />
                <span className="text-xs">Free shipping over $50</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-xs">2-year warranty</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Headphones className="h-4 w-4 text-green-400" />
                <span className="text-xs">24/7 gaming support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gaming Trust Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex flex-wrap items-center space-x-6 text-xs text-gray-500">
              <span>🏆 Trusted by Pro Gamers</span>
              <span>⚡ Lightning Fast Delivery</span>
              <span>🔒 Secure Payment</span>
              <span>🎯 Precision Gaming Gear</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate("/privacy")}
                className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate("/terms")}
                className="text-xs text-gray-500 hover:text-purple-400 transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-6 pt-6 text-center">
          <p className="text-gray-500 text-sm">
            © 2025 Gearnix. All rights reserved. Built for gamers, by gamers.
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Elevate your game. Dominate the competition.
          </p>
        </div>
      </div>
    </footer>
  );
}
