import React, { useState, useEffect } from 'react';
import './AddProduct.css';
import { getCategories, addProduct } from '../../api/api';
import { useSelector } from 'react-redux';

const AddProduct = ({ onClose, onAddProduct }) => {
  const [product, setProduct] = useState({
    name: '',
    farm: '',
    price: '',
    category: '',
    image: null,
    imageUrl: '',
    qunty:null
  });
  const [imageSource, setImageSource] = useState('upload'); // 'upload' or 'url'
  const [imagePreview, setImagePreview] = useState(''); // For image preview
  const [categories, setCategories] = useState([]);
  const { user } = useSelector((state) => state.auth); // Get user from Redux store

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        // console.log(data);
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
    console.log(product.category)
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, JPG, PNG, GIF)');
        return;
      }
      
      // Check file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      setProduct({ ...product, image: file, imageUrl: '' });
      
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    setProduct({ ...product, imageUrl: e.target.value, image: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Check if user is logged in and has a valid token
      const token = localStorage.getItem('token');
      if (!user || !token) {
        throw new Error('You must be logged in to add a product. Please log in and try again.');
      }

      // Validate required fields
      if (!product.name || !product.price || !product.category) {
        throw new Error('Please fill in all required fields');
      }

      // Check if image is provided
      if (imageSource === 'upload' && !product.image) {
        throw new Error('Please select an image to upload');
      } else if (imageSource === 'url' && !product.imageUrl) {
        throw new Error('Please enter an image URL');
      }

      // Log the category value for debugging
      console.log('Selected category ID:', product.category);
      
      // Ensure category is a valid MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(product.category)) {
        console.error('Invalid category ID format:', product.category);
        throw new Error('Invalid category selected. Please try again.');
      }

      // Create form data with proper field names
      const formData = new FormData();
      formData.append('name', product.name.trim());
      formData.append('price', Number(product.price));
      formData.append('category', product.category);
      formData.append('description', (product.description || '').trim());
      formData.append('farm', (product.farm || '').trim());
      formData.append('qunty', Number(product.qunty) || 1);

      // Add image based on the selected source
      if (imageSource === 'upload' && product.image) {
        formData.append('image', product.image);
      } else if (imageSource === 'url' && product.imageUrl) {
        formData.append('imageUrl', product.imageUrl.trim());
      }
      
      // Log the form data for debugging
      console.log('=== Form Data ===');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }
      
      console.log('=== Request Headers ===');
      console.log('Authorization:', `Bearer ${token ? `${token.substring(0, 15)}...` : 'MISSING'}`);
      
      try {
        // Use the addProduct function from the API module
        const response = await addProduct(formData);
        console.log('=== Response Data ===');
        console.log(response);
        
        // Reset form
        setProduct({
          name: '',
          farm: '',
          price: '',
          category: '',
          description: '',
          qunty: 1,
          image: null,
          imageUrl: ''
        });
        setImagePreview('');
        setImageSource('upload');
        
        onClose();
        onAddProduct(); // Refresh the product list
        alert('Product added successfully!');
      } catch (error) {
        console.error('API Error:', error);
        throw error; // Re-throw to be caught by the outer catch block
      }

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert(error.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>&times;</button>
        <h2>Add a New Product</h2>
        <form onSubmit={handleSubmit} className="add-product-form">
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input type="text" id="name" name="name" value={product.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="farm">Farm</label>
            <input type="text" id="farm" name="farm" value={product.farm} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price ($)</label>
            <input type="number" id="price" name="price" value={product.price} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={product.category} onChange={handleChange} required>
              <option value="" disabled>Select a category</option>
              {categories.map(cat => {
                // Log category data for debugging
                console.log('Category:', cat);
                return (
                  <option key={cat._id || cat.catId} value={cat._id || cat.catId}>
                    {cat.catName || cat.name}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="qunty">Quantity</label>
            <input type="number" id="qunty" name="qunty" value={product.qunty} onChange={handleChange} required />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Product Image</label>
            <div className="mb-3">
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="imageSource"
                  id="uploadSource"
                  value="upload"
                  checked={imageSource === 'upload'}
                  onChange={() => setImageSource('upload')}
                />
                <label className="form-check-label" htmlFor="uploadSource">
                  Upload Image
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="radio"
                  name="imageSource"
                  id="urlSource"
                  value="url"
                  checked={imageSource === 'url'}
                  onChange={() => setImageSource('url')}
                />
                <label className="form-check-label" htmlFor="urlSource">
                  Use Image URL
                </label>
              </div>
            </div>

            {imageSource === 'upload' ? (
              <div className="mb-3">
                <input
                  type="file"
                  className="form-control"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                <div className="form-text">
                  Accepted formats: JPG, PNG, GIF (max 5MB)
                </div>
              </div>
            ) : (
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  id="imageUrl"
                  value={product.imageUrl}
                  onChange={handleImageUrlChange}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}

            {(product.image || product.imageUrl) && (
              <div className="mt-3">
                <p className="mb-2 fw-bold">Preview:</p>
                <div className="border p-2" style={{ maxWidth: '200px' }}>
                  <img 
                    src={product.image ? URL.createObjectURL(product.image) : product.imageUrl} 
                    alt="Preview" 
                    className="img-fluid"
                    style={{ maxHeight: '150px' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="form-buttons">
            <button type="submit" className="submit-button">Add Product</button>
            <button type="button" className="cancel-button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
