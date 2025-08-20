import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Gamepad2 } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isOnLoginPage = location.pathname === "/auth/login";
  const isOnRegisterPage = location.pathname === "/auth/register";

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 px-4 sm:px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
            <Gamepad2 className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            GEARNIX
          </h1>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-3">
          {isOnRegisterPage ? (
            // On Register page - show "Sign In" button
            <Button
              variant="ghost"
              onClick={() => navigate("/auth/login")}
              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20"
            >
              Sign In
            </Button>
          ) : isOnLoginPage ? (
            // On Login page - show "Sign Up" button
            <Button
              onClick={() => navigate("/auth/register")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
            >
              Sign Up
            </Button>
          ) : (
            // On Home page - show both buttons
            <>
              <Button
                variant="ghost"
                onClick={() => navigate("/auth/login")}
                className="text-slate-300 hover:text-white hover:bg-slate-800"
              >
                Sign In
              </Button>
              <Button
                onClick={() => navigate("/auth/register")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
