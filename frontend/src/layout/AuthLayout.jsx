import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-blue-50">
      <Navbar />
      {/* Main content area where auth pages will render */}
      <main className="flex items-center justify-center px-4 py-12">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
