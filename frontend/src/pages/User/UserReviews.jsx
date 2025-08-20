// UserReviews.jsx - Complete implementation with fixed image handling
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reviewAPI } from "../../../services/reviewAPI";
import {
  Star,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Package,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  Calendar,
  X,
  Save,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

  const handleLoad = () => {
    console.log('🖼️ Image loaded successfully:', imageSrc);
  };

  // Update image source when prop changes
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
      onLoad={handleLoad}
    />
  );
};

export default function UserReviews() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalType, setModalType] = useState(null); // 'view', 'edit', 'delete'
  const [editForm, setEditForm] = useState({
    rating: 0,
    title: "",
    comment: "",
    recommend: null
  });

  // Dynamic reviews state
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch reviews on component mount
  useEffect(() => {
    fetchUserReviews();
  }, []);

  // FIXED: Fetch user's reviews from API with proper image handling
  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching user reviews...');
      const response = await reviewAPI.getUserReviews();
      
      if (response.success) {
        // Transform API data with proper image URL handling
        const transformedReviews = response.reviews.map(review => {
          // FIXED: Proper image URL handling
          let imageUrl = review.productImage;
          
          // Handle different image URL formats
          if (!imageUrl || imageUrl === '' || imageUrl === 'null') {
            imageUrl = "/api/placeholder/80/80";
          } else if (imageUrl.startsWith('/uploads/')) {
            // If it's a relative path, make it absolute
            imageUrl = `http://localhost:5000${imageUrl}`;
          } else if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/api/')) {
            // If it's not a full URL or placeholder, use fallback
            imageUrl = "/api/placeholder/80/80";
          }
          
          console.log('🖼️ Processing image:', { 
            original: review.productImage, 
            processed: imageUrl,
            productName: review.productName 
          });
          
          return {
            id: review.id,
            productId: review.productId,
            productName: review.productName,
            productImage: imageUrl,
            orderId: review.orderNumber || review.orderId,
            rating: review.rating,
            title: review.title || "Review",
            comment: review.comment || "",
            recommend: review.recommend,
            date: new Date(review.createdAt).toISOString().split('T')[0],
            verified: true,
            helpful: 0,
            totalVotes: 0
          };
        });
        
        console.log('✅ Reviews fetched and transformed:', transformedReviews);
        setReviews(transformedReviews);
      } else {
        setError(response.message || 'Failed to fetch reviews');
      }
    } catch (err) {
      console.error('❌ Error fetching reviews:', err);
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
                         review.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRating = ratingFilter === "all" || review.rating.toString() === ratingFilter;
    return matchesSearch && matchesRating;
  });

  // Modal handlers
  const openModal = (type, review = null) => {
    setModalType(type);
    setSelectedReview(review);
    if (type === 'edit' && review) {
      setEditForm({
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        recommend: review.recommend
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedReview(null);
    setEditForm({
      rating: 0,
      title: "",
      comment: "",
      recommend: null
    });
  };

  // Edit review handler with API call
  const handleEditReview = async (e) => {
    e.preventDefault();
    
    if (editForm.rating === 0) {
      alert("Please select a rating");
      return;
    }
    
    setUpdating(true);
    
    try {
      console.log('📝 Updating review:', selectedReview.id, editForm);
      
      const response = await reviewAPI.updateReview(selectedReview.id, {
        rating: editForm.rating,
        title: editForm.title,
        comment: editForm.comment,
        recommend: editForm.recommend
      });
      
      if (response.success) {
        // Update local state
        setReviews(reviews.map(review => 
          review.id === selectedReview.id 
            ? { 
                ...review, 
                ...editForm, 
                date: new Date().toISOString().split('T')[0] 
              }
            : review
        ));
        
        alert('✅ Review updated successfully!');
        closeModal();
      } else {
        throw new Error(response.message || 'Failed to update review');
      }
    } catch (error) {
      console.error('❌ Error updating review:', error);
      alert(`❌ Failed to update review: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Delete review handler with API call
  const handleDeleteReview = async () => {
    setDeleting(true);
    
    try {
      console.log('🗑️ Deleting review:', selectedReview.id);
      
      const response = await reviewAPI.deleteReview(selectedReview.id);
      
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

  const handleStarClick = (rating) => {
    setEditForm(prev => ({ ...prev, rating }));
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

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            My Reviews
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Loading your reviews...
          </p>
        </div>
        <div className="flex items-center justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <span className="ml-4 text-gray-300 text-lg">Loading your reviews...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            My Reviews
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            Manage and view your product reviews
          </p>
        </div>
        
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Reviews</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <Button 
              onClick={fetchUserReviews}
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
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              My Reviews
            </h1>
            <Button
              onClick={fetchUserReviews}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          <p className="text-gray-300 text-sm sm:text-base">
            Manage and view your product reviews ({reviews.length} total)
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium">Helpful Votes</p>
                  <p className="text-2xl font-bold text-white">
                    {reviews.reduce((sum, r) => sum + r.helpful, 0)}
                  </p>
                </div>
                <ThumbsUp className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs font-medium">Recommended</p>
                  <p className="text-2xl font-bold text-white">
                    {reviews.filter(r => r.recommend).length}
                  </p>
                </div>
                <ThumbsUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search reviews by product or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-400 focus:border-purple-500"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="bg-gray-800/50 border-gray-700 text-white hover:bg-gray-700">
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

        {/* Reviews List - FIXED with ProductImage component */}
        <div className="space-y-4">
          {filteredReviews.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No reviews found</h3>
                <p className="text-gray-400 mb-6">
                  {searchTerm || ratingFilter !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : "You haven't written any reviews yet. Purchase and review products to help other gamers!"
                  }
                </p>
                {!searchTerm && ratingFilter === "all" && (
                  <Button 
                    onClick={() => navigate("/user/orders")}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    View Orders
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredReviews.map((review) => (
              <Card key={review.id} className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* FIXED: Product Image with error handling */}
                    <ProductImage
                      src={review.productImage}
                      alt={review.productName}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />

                    {/* Review Content */}
                    <div className="flex-1 space-y-3">
                      {/* Product Name and Rating */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{review.productName}</h3>
                          <div className="flex items-center gap-2 mt-1">
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
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
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
                              onClick={() => openModal('edit', review)}
                              className="text-white hover:bg-gray-700"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Review
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

                      {/* Review Title */}
                      <h4 className="text-white font-medium">{review.title}</h4>

                      {/* Review Comment */}
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {review.comment.length > 200 
                          ? `${review.comment.substring(0, 200)}...` 
                          : review.comment
                        }
                      </p>

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
                            {review.helpful}/{review.totalVotes} found helpful
                          </div>
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

      {/* Modals with fixed image handling */}
      {modalType && selectedReview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                {modalType === 'view' && 'Review Details'}
                {modalType === 'edit' && 'Edit Review'}
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
                  {/* Product Info - FIXED */}
                  <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                    <ProductImage
                      src={selectedReview.productImage}
                      alt={selectedReview.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-white font-medium text-lg">{selectedReview.productName}</h3>
                      <p className="text-gray-400 text-sm">Order {selectedReview.orderId}</p>
                    </div>
                  </div>

                  {/* Rating and Title */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(selectedReview.rating, "h-6 w-6")}
                      <span className={`text-xl font-bold ${getRatingColor(selectedReview.rating)}`}>
                        {selectedReview.rating}/5
                      </span>
                    </div>
                    <h4 className="text-white font-semibold text-xl">{selectedReview.title}</h4>
                  </div>

                  {/* Full Comment */}
                  <div>
                    <Label className="text-gray-400 text-sm">Review</Label>
                    <p className="text-white mt-2 leading-relaxed">{selectedReview.comment}</p>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400 text-sm">Recommendation</Label>
                      <div className="flex items-center gap-2 mt-1">
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
                      <Label className="text-gray-400 text-sm">Review Date</Label>
                      <p className="text-white mt-1">{new Date(selectedReview.date).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-400 text-sm">Helpfulness</Label>
                    <p className="text-white mt-1">
                      {selectedReview.helpful} out of {selectedReview.totalVotes} people found this helpful
                    </p>
                  </div>
                </div>
              )}

              {/* Edit Review Modal */}
              {modalType === 'edit' && (
                <form onSubmit={handleEditReview} className="space-y-6">
                  {/* Product Info - FIXED */}
                  <div className="flex items-center gap-4 p-4 bg-gray-700/30 rounded-lg">
                    <ProductImage
                      src={selectedReview.productImage}
                      alt={selectedReview.productName}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="text-white font-medium text-lg">{selectedReview.productName}</h3>
                      <p className="text-gray-400 text-sm">Order {selectedReview.orderId}</p>
                    </div>
                  </div>

                  {/* Star Rating */}
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm font-medium">Rating *</Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleStarClick(star)}
                          className="transition-colors duration-150"
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= editForm.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-600 hover:text-yellow-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-gray-300">
                        {editForm.rating > 0 && `${editForm.rating} of 5 stars`}
                      </span>
                    </div>
                  </div>

                  {/* Review Title */}
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm font-medium">Review Title</Label>
                    <Input
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Summarize your experience..."
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-purple-500"
                    />
                  </div>

                  {/* Review Comment */}
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm font-medium">Your Review</Label>
                    <textarea
                      value={editForm.comment}
                      onChange={(e) => setEditForm(prev => ({ ...prev, comment: e.target.value }))}
                      placeholder="Tell others about your experience with this product..."
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 resize-none rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Recommendation */}
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm font-medium">Would you recommend this product?</Label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, recommend: true }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          editForm.recommend === true
                            ? "bg-green-600/20 border-green-500/50 text-green-400"
                            : "bg-gray-700/30 border-gray-600 text-gray-300 hover:border-gray-500"
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditForm(prev => ({ ...prev, recommend: false }))}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                          editForm.recommend === false
                            ? "bg-red-600/20 border-red-500/50 text-red-400"
                            : "bg-gray-700/30 border-gray-600 text-gray-300 hover:border-gray-500"
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4" />
                        No
                      </button>
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={updating}
                      className="bg-purple-600 hover:bg-purple-700 text-white flex-1 disabled:opacity-50"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {updating ? 'Updating...' : 'Update Review'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeModal}
                      disabled={updating}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* Delete Review Modal */}
              {modalType === 'delete' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-400" />
                    <div>
                      <h3 className="text-white font-semibold">Are you sure?</h3>
                      <p className="text-gray-300 text-sm">
                        This action cannot be undone. This will permanently delete your review for{' '}
                        <span className="font-medium text-white">{selectedReview.productName}</span>.
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
                      className="border-gray-600 text-gray-300"
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
