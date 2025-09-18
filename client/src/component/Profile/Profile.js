import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useSelector } from 'react-redux';
import AddProduct from './AddProduct';
import { getProductsByUser, deleteProduct, getUserOrders } from '../../api/api';

// Mock activity data - can be removed if not used
const mockActivity = [
  { id: 1, type: 'sale', description: 'Sale of "Sunny Bouquet"', amount: 45.00, date: '2023-10-26' },
  { id: 2, type: 'listing', description: 'New Listing: "Winter Rose Arrangement"', amount: null, date: '2023-10-25' },
  { id: 3, type: 'cashout', description: 'Withdrawal to bank account', amount: -500.00, date: '2023-10-24' },
  { id: 4, type: 'sale', description: 'Sale of "Tulip Medley"', amount: 35.50, date: '2023-10-22' },
];

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('listings');
  const [isModalOpen, setModalOpen] = useState(false);
  const [userProducts, setUserProducts] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setActiveTab(user.userType === 'Saler' ? 'listings' : 'orders');
    }
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        console.error('No user found');
        return;
      }
      
      setIsLoading(true);
      setError('');
      
      try {
        if (user.userType === 'Saler' && activeTab === 'listings') {
          console.log('Fetching user products...');
          const products = await getProductsByUser(user._id);
          console.log('Products loaded:', products);
          setUserProducts(products);
        } else if (activeTab === 'orders') {
          console.log('Fetching user orders for user ID:', user._id);
          const orders = await getUserOrders(user._id);
          console.log('Orders loaded:', orders);
          setUserOrders(Array.isArray(orders) ? orders : []);
        }
      } catch (err) {
        console.error('Failed to fetch data:', {
          error: err,
          message: err.message,
          stack: err.stack,
          response: err.response
        });
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }  
    };

    fetchData();
  }, [user, activeTab]);

  const handleCashout = () => {
    alert(`Cashing out $${user.balance}.`);
    // In a real app, trigger an API call and update state here
  };

  const handleAddProduct = (newProduct) => {
    // Re-fetch products to show the new one
    if (user && user.role === 'Saler') {
      getProductsByUser(user._id)
        .then(setUserProducts)
        .catch(err => console.error('Failed to refresh products:', err));
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(productId);
        setUserProducts(userProducts.filter(p => p._id !== productId));
        alert('Product deleted successfully.');
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product.');
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderContent = () => {
    if (isLoading) {
      return <div className="loading">Loading...</div>;
    }

    if (error) {
      return <div className="error">Error: {error}</div>;
    }

    switch (activeTab) {
      case 'listings':
        return (
          <div className="tab-content">
            <div className="listings-header">
              <h3>Your Listings</h3>
              {user?.userType === 'Saler' && (
                <button className="add-product-button" onClick={() => setModalOpen(true)}>
                  + Add New Product
                </button>
              )}
            </div>
            {userProducts.length > 0 ? (
              <ul className="product-list">
                {userProducts.map(product => (
                  <li key={product._id} className="product-item">
                    <div className="product-image-container">
                      <img 
                        src={product.image || ''} 
                        alt={product.name || 'Product'}
                        className="product-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                        }}
                      />
                    </div>
                    <div className="product-details">
                      <span className="product-name">{product.name}</span>
                      <span className="product-price">${product.price}</span>
                      <span className="product-stock">Stock: {product.qunty || 0}</span>
                    </div>
                    <div className="product-actions">
                      <button onClick={() => handleDeleteProduct(product._id || product._id)} className="delete-button">
                        <i className="fa fa-trash"></i> Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Your product listings will appear here.</p>
            )}
          </div>
        );
      case 'orders':
        return (
          <div className="tab-content">
            <h3>Your Orders</h3>
            {userOrders.length === 0 ? (
              <div className="no-orders">
                <p>You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="orders-list">
                {userOrders.map(order => (
                  <div key={order._id} className="order-card">
                    <div className="order-header">
                      <span className="order-id">Order #{order._id.slice(-6).toUpperCase()}</span>
                      <span className={`order-status ${order.status}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="order-date">
                      Ordered on {formatDate(order.createdAt)}
                    </div>
                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <img 
                            src={item.product?.image || ''} 
                            alt={item.product?.name || 'Product'}
                            className="order-item-image"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '';
                            }}
                          />
                          <div className="order-item-details">
                            <div className="order-item-name">{item.product?.name || 'Product'}</div>
                            <div className="order-item-quantity">Quantity: {item.quantity}</div>
                          </div>
                          <div className="order-item-price">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="order-total">
                      <span>Total:</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'activity':
        return (
          <div className="tab-content">
            <ul className="activity-log">
              {mockActivity.map(item => (
                <li key={item._id} className={`activity-item activity-${item.type}`}>
                  <div className="activity-description">{item.description}</div>
                  <div className="activity-details">
                    <span className="activity-date">{item.date}</span>
                    {item.amount !== null && (
                      <span className={`activity-amount ${item.amount > 0 ? 'positive' : 'negative'}`}>
                        {item.amount > 0 ? '+' : ''}${item.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        );
      case 'settings':
        return <div className="tab-content">Account settings and options will be here.</div>;
      default:
        return "listings";
    }
  };

  if (!user) {
    return <div>Loading...</div>; // Or a redirect to login
  }

  return (
    <div className="profile-container">
      {isModalOpen && <AddProduct onClose={() => setModalOpen(false)} onAddProduct={handleAddProduct} />}
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-container">
            <img 
              src={user.userImg || ''} 
              alt="User Avatar" 
              className="profile-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
              }}
            />
          </div>
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <span className="profile-role">{user.userType}</span>
        </div>

        {/* Wallet Section for Sellers */}
      
          <div className="profile-wallet">
            <div className="balance-info">
              <span className="balance-label">Available Balance</span>
              <span className="balance-amount">${user.balance}</span>
            </div>
            <button className="cashout-button" onClick={handleCashout}>Cash Out</button>
          </div>
        <div className="profile-tabs">
          {user.userType === 'Saler' ? (
            <button
              className={`tab-button ${activeTab === 'listings' ? 'active' : ''}`}
              onClick={() => setActiveTab('listings')}
            >
              My Listings
            </button>
          ):(<></>)}
           <button
              className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Order History
            </button>
          <button
            className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            Activity
          </button>
          <button
            className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
        <div className="profile-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;