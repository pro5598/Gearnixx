import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Gamepad2,
  Headphones,
  Mouse,
  Keyboard,
  ArrowRight,
  Star,
  CheckCircle,
  Zap,
  Shield,
  Truck,
  Award,
  ShoppingBag,
} from "lucide-react";
import Navbar from "../components/common/Navbar.jsx";
import Footer from "../components/common/Footer.jsx";
import image from "../assets/logo/image.png"
import imagem from "../assets/logo/imagemouse.png"
import imagek from "../assets/logo/image copy.png"
import imageh from "../assets/logo/image copy 2.png"

export default function Home() {
  const navigate = useNavigate();

  const featuredProducts = [
    {
      id: 1,
      name: "RGB Gaming Mouse",
      price: "$49.99",
      originalPrice: "$69.99",
      image: imagem,
      rating: 4.8,
      reviews: 124,
    },
    {
      id: 2,
      name: "Mechanical Keyboard",
      price: "$89.99",
      originalPrice: "$119.99",
      image:imagek,
      rating: 4.9,
      reviews: 89,
    },
    {
      id: 3,
      name: "Wireless Gaming Headset",
      price: "$79.99",
      originalPrice: "$99.99",
      image: imageh,
      rating: 4.7,
      reviews: 156,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Navbar />
      
      {/* Hero Section - No top gap */}
      <section className="w-full px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              {/* Badge */}
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 px-4 py-2 text-sm inline-flex items-center"
              >
                <Zap className="w-4 h-4 mr-2" />
                Gaming Gear Store
              </Badge>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Level Up Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Gaming Setup
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-gray-300 max-w-2xl leading-relaxed">
                Discover premium gaming accessories designed for champions. From high-performance mice to immersive headsets - we've got everything you need to dominate.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4 sm:pt-8">
                <Button
                  size="lg"
                  onClick={() => navigate("/shop")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-200"
                >
                  Shop Now
                  <ShoppingBag className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/collections")}
                  className="border-2 border-purple-500 text-purple-400 hover:bg-purple-600 hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg transition-all duration-200"
                >
                  View Collections
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-2 sm:space-y-0 sm:space-x-6 lg:space-x-8 pt-8 sm:pt-12 text-gray-400 text-sm sm:text-base">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  <span>2-Year Warranty</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  <span>24/7 Support</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative mt-8 lg:mt-0">
              <div className="relative z-10 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl p-6 sm:p-8 backdrop-blur-sm border border-purple-500/30">
                <img
                  src={image}
                  alt="Gaming Setup"
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-2xl blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Featured Gaming Gear
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Hand-picked accessories that pros use to stay ahead of the competition
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm">
                <CardHeader className="p-0">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 sm:h-56 object-cover rounded-t-lg"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-gray-600"
                          }`}
                        />
                      ))}
                      <span className="text-xs sm:text-sm text-gray-400 ml-2">
                        ({product.reviews})
                      </span>
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl text-white mb-2">
                    {product.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-lg sm:text-xl font-bold text-purple-400">
                      {product.price}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {product.originalPrice}
                    </span>
                  </div>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="w-full px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Find the perfect gear for your gaming style
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Category Cards */}
            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-600/30 transition-colors">
                  <Mouse className="h-8 w-8 text-purple-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-white">
                  Gaming Mice
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-400">
                  Precision gaming mice with customizable DPI and RGB lighting
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600/30 transition-colors">
                  <Keyboard className="h-8 w-8 text-blue-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-white">
                  Keyboards
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-400">
                  Mechanical keyboards built for speed and durability
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-600/30 transition-colors">
                  <Headphones className="h-8 w-8 text-green-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-white">
                  Headsets
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-400">
                  Immersive audio headsets with crystal-clear microphones
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm cursor-pointer group">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-pink-600/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-600/30 transition-colors">
                  <Gamepad2 className="h-8 w-8 text-pink-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-white">
                  Controllers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-400">
                  Pro-level controllers for console and PC gaming
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full bg-gray-800/30 backdrop-blur-sm border-y border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">50K+</div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">Happy Gamers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">1000+</div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">Products</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">98%</div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">Satisfaction</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">24/7</div>
              <div className="text-gray-400 mt-2 text-sm sm:text-base">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Gearnix?
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              We're committed to providing the best gaming experience
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-8 w-8 text-green-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-white">
                  Free Shipping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Free shipping on all orders over $50. Fast delivery worldwide.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm text-center">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-white">
                  2-Year Warranty
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Comprehensive warranty coverage on all gaming accessories.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm text-center sm:col-span-2 lg:col-span-1">
              <CardHeader className="pb-4">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-purple-400" />
                </div>
                <CardTitle className="text-lg sm:text-xl font-semibold text-white">
                  Pro Quality
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Professional-grade equipment trusted by esports champions.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 text-white">
            <CardContent className="text-center py-12 sm:py-16 px-4 sm:px-8">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Dominate?
              </h2>
              <p className="text-lg sm:text-xl text-purple-100 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of gamers who trust Gearnix for their gaming setup. 
                Upgrade your gear and unleash your potential.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/shop")}
                  className="bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                >
                  Shop All Products
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate("/deals")}
                  className=" bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold"
                >
                  View Deals
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
