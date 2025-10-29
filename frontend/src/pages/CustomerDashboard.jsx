import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPurchases: 0,
    wishlistItems: 0,
    pendingOrders: 0,
    totalSpent: 0
  });
  const [wishlistPreview, setWishlistPreview] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls
      const statsResponse = await fetch('/api/customer/stats');
      const wishlistResponse = await fetch('/api/customer/wishlist?limit=3');
      const ordersResponse = await fetch('/api/customer/orders?limit=5');
      const recommendationsResponse = await fetch('/api/customer/recommendations?limit=3');

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        setWishlistPreview(wishlistData);
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData);
      }

      if (recommendationsResponse.ok) {
        const recommendationsData = await recommendationsResponse.json();
        setRecommendations(recommendationsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Collector Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.fullName || 'Collector'}!</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-title">Total Purchases</h3>
            <p className="stat-value">{stats.totalPurchases}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Wishlist Items</h3>
            <p className="stat-value">{stats.wishlistItems}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Pending Orders</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Total Spent</h3>
            <p className="stat-value">${stats.totalSpent}</p>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="dashboard-section">
          <div className="dashboard-grid">
            {/* Wishlist Preview */}
            <div>
              <h2 className="section-title">Your Wishlist</h2>
              <div className="wishlist-preview">
                {wishlistPreview.length > 0 ? (
                  wishlistPreview.map(item => (
                    <div key={item.id} className="wishlist-preview-item">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="wishlist-preview-image"
                      />
                      <div className="wishlist-preview-info">
                        <h4 className="wishlist-preview-title">{item.title}</h4>
                        <p className="wishlist-preview-artist">{item.artist}</p>
                        <p className="wishlist-preview-price">${item.price}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Your wishlist is empty. Start exploring!</p>
                )}
              </div>
              <div className="view-all-link">
                <a href="/wishlist" className="view-all-btn">View Full Wishlist</a>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="section-title">Recent Orders</h2>
              <div className="activity-list">
                {recentOrders.length > 0 ? (
                  recentOrders.map(order => (
                    <div key={order.id} className="activity-item">
                      <div className="activity-info">
                        Order #{order.id} - {order.artworkTitle}
                      </div>
                      <div className="activity-meta">
                        Status: {order.status} • {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No recent orders.</p>
                )}
              </div>
              <div className="view-all-link">
                <a href="/orders" className="view-all-btn">View All Orders</a>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <h2 className="section-title">Recommended for You</h2>
          <div className="recommendations-list">
            {recommendations.length > 0 ? (
              recommendations.map(artwork => (
                <div key={artwork.id} className="recommendation-item">
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="recommendation-image"
                  />
                  <div className="recommendation-info">
                    <h4 className="recommendation-title">{artwork.title}</h4>
                    <p className="recommendation-artist">{artwork.artist}</p>
                    <p className="recommendation-price">${artwork.price}</p>
                  </div>
                </div>
              ))
            ) : (
              <p>No recommendations available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
