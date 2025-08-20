import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Upload, Package } from "lucide-react";
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

export default function AddProductModal({ isOpen, onClose, onSubmit }) {
  const navigate = useNavigate();
  const [newProductForm, setNewProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    features: "",
    brand: "Gearnix",
    weight: "",
    connectivity: "",
    images: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // Name validation (max 200 characters)
    if (!newProductForm.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (newProductForm.name.length > 200) {
      newErrors.name = 'Product name must be less than 200 characters';
    }

    // Description validation (max 2000 characters)
    if (!newProductForm.description.trim()) {
      newErrors.description = 'Product description is required';
    } else if (newProductForm.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    // Price validation
    if (!newProductForm.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(newProductForm.price) || parseFloat(newProductForm.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    // Category validation
    if (!newProductForm.category) {
      newErrors.category = 'Category is required';
    }

    // Stock validation
    if (!newProductForm.stock) {
      newErrors.stock = 'Stock quantity is required';
    } else if (isNaN(newProductForm.stock) || parseInt(newProductForm.stock) < 0) {
      newErrors.stock = 'Please enter a valid stock quantity';
    }

    // Features validation (max 1000 characters)
    if (newProductForm.features && newProductForm.features.length > 1000) {
      newErrors.features = 'Features must be less than 1000 characters';
    }

    // Brand validation (max 100 characters)
    if (newProductForm.brand && newProductForm.brand.length > 100) {
      newErrors.brand = 'Brand name must be less than 100 characters';
    }

    // Weight validation (max 50 characters)
    if (newProductForm.weight && newProductForm.weight.length > 50) {
      newErrors.weight = 'Weight must be less than 50 characters';
    }

    // Connectivity validation (max 200 characters)
    if (newProductForm.connectivity && newProductForm.connectivity.length > 200) {
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
      await onSubmit(newProductForm);
      // Reset form after successful submission
      setNewProductForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        features: "",
        brand: "Gearnix",
        weight: "",
        connectivity: "",
        images: null
      });
      setErrors({});
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewProductForm({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      features: "",
      brand: "Gearnix",
      weight: "",
      connectivity: "",
      images: null
    });
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
      setNewProductForm(prev => ({ ...prev, images: files }));
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col border border-gray-700 shadow-2xl mx-2 sm:mx-0">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-400" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">Add New Product</h2>
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
                    value={newProductForm.name}
                    onChange={(e) => setNewProductForm({...newProductForm, name: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter product name"
                    maxLength={200}
                    required
                  />
                  {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                  <p className="text-gray-500 text-xs">{newProductForm.name.length}/200 characters</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">
                    Price <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({...newProductForm, price: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.price ? 'border-red-500' : ''}`}
                    placeholder="0.00"
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
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({...newProductForm, description: e.target.value})}
                  rows={4}
                  maxLength={2000}
                  className={`w-full px-3 py-2 bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 resize-none rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.description ? 'border-red-500' : ''}`}
                  placeholder="Enter product description"
                  required
                />
                {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
                <p className="text-gray-500 text-xs">{newProductForm.description.length}/2000 characters</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">
                    Category <span className="text-red-400">*</span>
                  </Label>
                  <Select value={newProductForm.category} onValueChange={(value) => setNewProductForm({...newProductForm, category: value})}>
                    <SelectTrigger className={`bg-gray-700/50 border-gray-600 text-white ${errors.category ? 'border-red-500' : ''}`}>
                      <SelectValue placeholder="Select category" />
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
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({...newProductForm, stock: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.stock ? 'border-red-500' : ''}`}
                    placeholder="0"
                    required
                  />
                  {errors.stock && <p className="text-red-400 text-xs">{errors.stock}</p>}
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Features</Label>
                <textarea
                  value={newProductForm.features}
                  onChange={(e) => setNewProductForm({...newProductForm, features: e.target.value})}
                  rows={3}
                  maxLength={1000}
                  className={`w-full px-3 py-2 bg-gray-700/50 border border-gray-600 text-white placeholder:text-gray-400 resize-none rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${errors.features ? 'border-red-500' : ''}`}
                  placeholder="List key features (e.g., RGB lighting, wireless, etc.)"
                />
                {errors.features && <p className="text-red-400 text-xs">{errors.features}</p>}
                <p className="text-gray-500 text-xs">{newProductForm.features.length}/1000 characters</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Brand</Label>
                  <Input
                    value={newProductForm.brand}
                    onChange={(e) => setNewProductForm({...newProductForm, brand: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.brand ? 'border-red-500' : ''}`}
                    placeholder="Brand name"
                    maxLength={100}
                  />
                  {errors.brand && <p className="text-red-400 text-xs">{errors.brand}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Weight</Label>
                  <Input
                    value={newProductForm.weight}
                    onChange={(e) => setNewProductForm({...newProductForm, weight: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.weight ? 'border-red-500' : ''}`}
                    placeholder="e.g., 85g"
                    maxLength={50}
                  />
                  {errors.weight && <p className="text-red-400 text-xs">{errors.weight}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm font-medium">Connectivity</Label>
                  <Input
                    value={newProductForm.connectivity}
                    onChange={(e) => setNewProductForm({...newProductForm, connectivity: e.target.value})}
                    className={`bg-gray-700/50 border-gray-600 text-white ${errors.connectivity ? 'border-red-500' : ''}`}
                    placeholder="e.g., Wireless, USB-C"
                    maxLength={200}
                  />
                  {errors.connectivity && <p className="text-red-400 text-xs">{errors.connectivity}</p>}
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm font-medium">Product Images</Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300 text-sm">Click to upload images</p>
                    <p className="text-gray-500 text-xs mt-1">PNG, JPG, GIF up to 5MB each (max 5 files)</p>
                  </label>
                  {newProductForm.images && (
                    <p className="text-purple-400 text-sm mt-2">
                      {newProductForm.images.length} file(s) selected
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
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
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
