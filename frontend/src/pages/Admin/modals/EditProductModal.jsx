import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save, X, Edit, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditProductModal({ isOpen, onClose, onSubmit, product }) {
  const navigate = useNavigate();
  const params = useParams();
  const [editForm, setEditForm] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setEditForm({ ...product });
    }
  }, [product]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation (max 200 characters)
    if (!editForm.name?.trim()) {
      newErrors.name = 'Product name is required';
    } else if (editForm.name.length > 200) {
      newErrors.name = 'Product name must be less than 200 characters';
    }

    // Description validation (max 2000 characters)
    if (!editForm.description?.trim()) {
      newErrors.description = 'Product description is required';
    } else if (editForm.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    // Price validation
    if (!editForm.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(editForm.price) || parseFloat(editForm.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    // Category validation
    if (!editForm.category) {
      newErrors.category = 'Category is required';
    }

    // Stock validation
    if (editForm.stock === undefined || editForm.stock === null || editForm.stock === '') {
      newErrors.stock = 'Stock quantity is required';
    } else if (isNaN(editForm.stock) || parseInt(editForm.stock) < 0) {
      newErrors.stock = 'Please enter a valid stock quantity';
    }

    // Features validation (max 1000 characters)
    if (editForm.features && editForm.features.length > 1000) {
      newErrors.features = 'Features must be less than 1000 characters';
    }

    // Brand validation (max 100 characters)
    if (editForm.brand && editForm.brand.length > 100) {
      newErrors.brand = 'Brand name must be less than 100 characters';
    }

    // Weight validation (max 50 characters)
    if (editForm.weight && editForm.weight.length > 50) {
      newErrors.weight = 'Weight must be less than 50 characters';
    }

    // Connectivity validation (max 200 characters)
    if (editForm.connectivity && editForm.connectivity.length > 200) {
      newErrors.connectivity = 'Connectivity must be less than 200 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(editForm);
      setErrors({});
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEditForm({});
    setErrors({});
    navigate('/admin/products');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setEditForm(prev => ({ ...prev, images: files }));
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col border border-gray-700 shadow-2xl mx-2 sm:mx-0">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-400" />
              <h2 className="text-xl sm:text-2xl font-bold text-white">Edit Product</h2>
            </div>
            <p className="text-gray-400 text-sm mt-1">Product ID: {params.id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">
                    Product Name <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.name ? 'border-red-500' : ''}`}
                    maxLength={200}
                    required
                  />
                  {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                  <p className="text-gray-500 text-xs">{(editForm.name || '').length}/200 characters</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">
                    Price <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.price || ''}
                    onChange={(e) => setEditForm({...editForm, price: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.price ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.price && <p className="text-red-400 text-xs">{errors.price}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">
                  Description <span className="text-red-400">*</span>
                </Label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  rows={4}
                  maxLength={2000}
                  className={`w-full px-3 py-2 bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 resize-none rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.description ? 'border-red-500' : ''}`}
                  required
                />
                {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
                <p className="text-gray-500 text-xs">{(editForm.description || '').length}/2000 characters</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">
                    Category <span className="text-red-400">*</span>
                  </Label>
                  <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                    <SelectTrigger className={`bg-gray-700/50 border-gray-600 text-white ${errors.category ? 'border-red-500' : ''}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="mice" className="text-white hover:bg-gray-700">Gaming Mice</SelectItem>
                      <SelectItem value="keyboards" className="text-white hover:bg-gray-700">Keyboards</SelectItem>
                      <SelectItem value="headsets" className="text-white hover:bg-gray-700">Headsets</SelectItem>
                      <SelectItem value="controllers" className="text-white hover:bg-gray-700">Controllers</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-400 text-xs">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">
                    Stock Quantity <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.stock || ''}
                    onChange={(e) => setEditForm({...editForm, stock: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.stock ? 'border-red-500' : ''}`}
                    required
                  />
                  {errors.stock && <p className="text-red-400 text-xs">{errors.stock}</p>}
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Features</Label>
                <textarea
                  value={editForm.features || ''}
                  onChange={(e) => setEditForm({...editForm, features: e.target.value})}
                  rows={3}
                  maxLength={1000}
                  className={`w-full px-3 py-2 bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 resize-none rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.features ? 'border-red-500' : ''}`}
                  placeholder="List key features"
                />
                {errors.features && <p className="text-red-400 text-xs">{errors.features}</p>}
                <p className="text-gray-500 text-xs">{(editForm.features || '').length}/1000 characters</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Brand</Label>
                  <Input
                    value={editForm.brand || ''}
                    onChange={(e) => setEditForm({...editForm, brand: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.brand ? 'border-red-500' : ''}`}
                    maxLength={100}
                  />
                  {errors.brand && <p className="text-red-400 text-xs">{errors.brand}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Weight</Label>
                  <Input
                    value={editForm.weight || ''}
                    onChange={(e) => setEditForm({...editForm, weight: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.weight ? 'border-red-500' : ''}`}
                    maxLength={50}
                  />
                  {errors.weight && <p className="text-red-400 text-xs">{errors.weight}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Connectivity</Label>
                  <Input
                    value={editForm.connectivity || ''}
                    onChange={(e) => setEditForm({...editForm, connectivity: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.connectivity ? 'border-red-500' : ''}`}
                    maxLength={200}
                  />
                  {errors.connectivity && <p className="text-red-400 text-xs">{errors.connectivity}</p>}
                </div>
              </div>

              {/* Current Images Display */}
              {editForm.images && editForm.images.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Current Images</Label>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(editForm.images) ? editForm.images.map((img, index) => (
                      <img
                        key={index}
                        src={`http://localhost:5000${img}`}
                        alt={`Product ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border border-gray-600"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/80/80";
                        }}
                      />
                    )) : null}
                  </div>
                </div>
              )}

              {/* New Image Upload */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Upload New Images (Optional)</Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload-edit"
                  />
                  <label htmlFor="file-upload-edit" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300 text-sm">Click to upload new images</p>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG, GIF up to 5MB each (max 5 files)</p>
                  </label>
                  {editForm.images && editForm.images instanceof FileList && (
                    <p className="text-purple-400 text-sm mt-2">
                      {editForm.images.length} new file(s) selected
                    </p>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="flex-shrink-0 border-t border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white flex-1 sm:flex-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="border-gray-600 text-gray-300">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
