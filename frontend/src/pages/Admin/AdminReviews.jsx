// AdminReviews.jsx - Complete implementation with real review data
import { useState, useEffect } from "react";
import { reviewAPI } from "../../../services/reviewAPI"; // Import review API
import {
  Star,
  Search,
  Filter,
  Eye,
  Trash2,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  User,
  Package,
  Calendar,
  X,
  AlertTriangle,
  CheckCircle,
  Flag,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ADDED: Image component with error handling
const ProductImage = ({ src, alt, className, fallbackSrc = "/api/placeholder/80/80" }) => {
  const [imageSrc, setImageSrc] = useState(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imageSrc !== fallbackSrc) {
      console.log('🖼️ Image failed to load, using fallback:', src);
      setImageSrc(fallbackSrc);
      setHasError(true);
    }
  };

  useEffect(() => {
    setImageSrc(src || fallbackSrc);
    setHasError(false);
  }, [src, fallbackSrc]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default function AdminReviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalType, setModalType] = useState(null); // 'view', 'delete'

  // UPDATED: Dynamic reviews state
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // ADDED: Fetch all reviews on component mount
  useEffect(() => {
    fetchAllReviews();
  }, []);

  // ADDED: Fetch all reviews from API
  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Admin fetching all reviews...');
      const response = await reviewAPI.getAllReviews(); // You'll need to add this method
      
      if (response.success) {
        // Transform API data to match component structure
        const transformedReviews = response.reviews.map(review => {
          // Handle image URL processing
          let imageUrl = review.productImage;
          if (!imageUrl || imageUrl === '' || imageUrl === 'null') {
            imageUrl = "/api/placeholder/80/80";
          } else if (imageUrl.startsWith('/uploads/')) {
            imageUrl = `http://localhost:5000${imageUrl}`;
          } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/api/')) {
            imageUrl = "/api/placeholder/80/80";
          }
          
          return {
            id: review.id,
            productId: review.productId,
            productName: review.productName,
            productImage: imageUrl,
            customerId: review.userId,
            customerName: review.userName || `${review.userFirstName} ${review.userLastName}`,
            customerEmail: review.userEmail,
            orderId: review.orderNumber || review.orderId,
            rating: review.rating,
            title: review.title || "Review",
            comment: review.comment || "",
            recommend: review.recommend,
            date: new Date(review.createdAt).toISOString().split('T')[0],
            verified: review.isVerifiedPurchase,

          };
        });
        
        console.log('✅ Admin reviews fetched:', transformedReviews);
        setReviews(transformedReviews);
      } else {
        setError(response.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      console.error('❌ Error fetching admin reviews:', err);
      setError(err.message || 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return "text-green-400";
    if (rating >= 3) return "text-yellow-400";
    return "text-red-400";
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  // Modal handlers
  const openModal = (type, review = null) => {
    setModalType(type);
    setSelectedReview(review);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedReview(null);
  };

  // UPDATED: Delete review with API call
  const handleDeleteReview = async () => {
    setDeleting(true);
    
    try {
      console.log('🗑️ Admin deleting review:', selectedReview.id);
      
      const response = await reviewAPI.adminDeleteReview(selectedReview.id); // You'll need to add this method
      
      if (response.success) {
        setReviews(reviews.filter(review => review.id !== selectedReview.id));
        alert('✅ Review deleted successfully!');
        closeModal();
      } else {
        throw new Error(response.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      alert(`❌ Failed to delete review: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const renderStars = (rating, size = "h-4 w-4") => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size} ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  // ADDED: Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Reviews Management
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Loading customer reviews...
          </p>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <span className="ml-4 text-gray-300 text-lg">Loading reviews...</span>
        </div>
      </div>
    );
  }

  // ADDED: Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Reviews Management
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            View and manage customer product reviews
          </p>
        </div>
        
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Reviews</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button 
              onClick={fetchAllReviews}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header - UPDATED with refresh button */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Reviews Management
            </h1>
            <Button
              onClick={fetchAllReviews}
              variant="ghost"
              size="sm"
              className="text-gray-300 "
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-gray-300 text-sm sm:text-base">
            View and manage customer product reviews ({reviews.length} total)
          </p>
        </div>

        {/* Stats Cards - UPDATED with real data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium">Total Reviews</p>
                  <p className="text-2xl font-bold text-white">{reviews.length}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium">Average Rating</p>
                  <p className="text-2xl font-bold text-white">
                    {reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                  </p>
                </div>
                <div className="text-yellow-400">
                  {renderStars(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
                </div>
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search reviews by product, customer, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gray-700/50 border-gray-600 text-white hover:bg-gray-600">
                <Filter className="h-4 w-4 mr-2" />
                Rating: {ratingFilter === "all" ? "All" : `${ratingFilter} stars`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800 border-gray-700">
              <DropdownMenuItem onClick={() => setRatingFilter("all")} className="text-white hover:bg-gray-700">
                All Ratings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRatingFilter("5")} className="text-white hover:bg-gray-700">
                5 Stars
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRatingFilter("4")} className="text-white hover:bg-gray-700">
                4 Stars
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRatingFilter("3")} className="text-white hover:bg-gray-700">
                3 Stars
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRatingFilter("2")} className="text-white hover:bg-gray-700">
                2 Stars
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRatingFilter("1")} className="text-white hover:bg-gray-700">
                1 Star
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Reviews List - UPDATED with ProductImage component */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No reviews found</h3>
                <p className="text-gray-400">
                  {searchTerm || ratingFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "No customer reviews available yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Review Header */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* FIXED: Product Image with error handling */}
                        <ProductImage
                          src={review.productImage}
                          alt={review.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {renderStars(review.rating)}
                            <span className={`text-sm font-medium ${getRatingColor(review.rating)}`}>
                              {review.rating}/5
                            </span>
                            {review.verified && (
                              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-white font-semibold text-lg">{review.title}</h4>
                          <p className="text-gray-400 text-sm">
                            {review.productName} • By {review.customerName}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white hover:bg-gray-700/50">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-800 border-gray-700">
                            <DropdownMenuItem 
                              onClick={() => openModal('view', review)}
                              className="text-white hover:bg-gray-700"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => openModal('delete', review)}
                              className="text-red-400 hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Review Content */}
                    <div>
                      <p className="text-gray-300 leading-relaxed">
                        {review.comment.length > 300 
                          ? `${review.comment.substring(0, 300)}...` 
                          : review.comment
                        }
                      </p>
                    </div>

                    {/* Review Footer */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-gray-700">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(review.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Order {review.orderId}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {review.customerEmail}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {review.recommend !== null && (
                          <div className="flex items-center gap-1">
                            {review.recommend ? (
                              <ThumbsUp className="h-4 w-4 text-green-400" />
                            ) : (
                              <ThumbsDown className="h-4 w-4 text-red-400" />
                            )}
                            <span className="text-sm text-gray-400">
                              {review.recommend ? "Recommended" : "Not Recommended"}
                            </span>
                          </div>
                        )}
                        
                        <div className="text-sm text-gray-400">
                          {review.helpful}/{review.totalVotes} helpful
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modals - UPDATED with ProductImage components */}
      {modalType && selectedReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {modalType === 'view' && 'Review Details'}
                {modalType === 'delete' && 'Delete Review'}
              </h2>
              <Button variant="ghost" size="sm" onClick={closeModal} className="text-gray-400 hover:text-white">
                <X className="h-6 w-6" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* View Review Modal */}
              {modalType === 'view' && (
                <div className="space-y-6">
                  {/* Product and Customer Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Product Information
                      </h4>
                      <div className="flex items-center gap-3">
                        <ProductImage
                          src={selectedReview.productImage}
                          alt={selectedReview.productName}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-white font-medium">{selectedReview.productName}</p>
                          <p className="text-gray-400 text-sm">Product ID: {selectedReview.productId}</p>
                          <p className="text-gray-400 text-sm">Order: {selectedReview.orderId}</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-700/30 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Customer Information
                      </h4>
                      <div className="space-y-2">
                        <p className="text-white">{selectedReview.customerName}</p>
                        <p className="text-gray-400 text-sm">{selectedReview.customerEmail}</p>
                        <p className="text-gray-400 text-sm">Customer ID: {selectedReview.customerId}</p>
                        {selectedReview.verified && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Review Details */}
                  <div className="bg-gray-700/30 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Review Details</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        {renderStars(selectedReview.rating, "h-6 w-6")}
                        <span className={`text-xl font-bold ${getRatingColor(selectedReview.rating)}`}>
                          {selectedReview.rating}/5
                        </span>
                      </div>
                      <div>
                        <h5 className="text-white font-semibold text-xl mb-2">{selectedReview.title}</h5>
                        <p className="text-gray-300 leading-relaxed">{selectedReview.comment}</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Recommendation</h4>
                      <div className="flex items-center gap-2">
                        {selectedReview.recommend ? (
                          <>
                            <ThumbsUp className="h-4 w-4 text-green-400" />
                            <span className="text-green-400">Recommended</span>
                          </>
                        ) : (
                          <>
                            <ThumbsDown className="h-4 w-4 text-red-400" />
                            <span className="text-red-400">Not Recommended</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-2">Helpfulness</h4>
                      <p className="text-gray-300">
                        {selectedReview.helpful} out of {selectedReview.totalVotes} people found this helpful
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-white font-semibold mb-2">Review Date</h4>
                    <p className="text-gray-300">{new Date(selectedReview.date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}

              {/* Delete Review Modal */}
              {modalType === 'delete' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                    <div>
                      <h3 className="text-white font-semibold">Are you sure?</h3>
                      <p className="text-gray-300 text-sm">
                        This action cannot be undone. This will permanently delete the review for{' '}
                        <span className="font-medium text-white">{selectedReview.productName}</span> by{' '}
                        <span className="font-medium text-white">{selectedReview.customerName}</span>.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={handleDeleteReview} 
                      disabled={deleting}
                      className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {deleting ? 'Deleting...' : 'Delete Review'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={closeModal}
                      disabled={deleting}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
