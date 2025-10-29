import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ArtistDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalArtworks: 0,
    totalSales: 0,
    pendingOrders: 0,
    totalEarnings: 0
  });
  const [recentArtworks, setRecentArtworks] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulate API calls
      const statsResponse = await fetch('/api/artist/stats');
      const artworksResponse = await fetch('/api/artist/artworks?limit=5');
      const ordersResponse = await fetch('/api/artist/orders?limit=5');

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (artworksResponse.ok) {
        const artworksData = await artworksResponse.json();
        setRecentArtworks(artworksData);
      }

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setRecentOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Artist Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, {user?.fullName || 'Artist'}!</p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3 className="stat-title">Total Artworks</h3>
            <p className="stat-value">{stats.totalArtworks}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Total Sales</h3>
            <p className="stat-value">{stats.totalSales}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Pending Orders</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
          </div>
          <div className="stat-card">
            <h3 className="stat-title">Total Earnings</h3>
            <p className="stat-value">${stats.totalEarnings}</p>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="dashboard-section">
          <div className="dashboard-grid">
            {/* Recent Artworks */}
            <div>
              <h2 className="section-title">Recent Artworks</h2>
              <div className="artworks-preview">
                {recentArtworks.length > 0 ? (
                  recentArtworks.map(artwork => (
                    <div key={artwork.id} className="artwork-preview-item">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="artwork-preview-image"
                      />
                      <div className="artwork-preview-info">
                        <h4 className="artwork-preview-title">{artwork.title}</h4>
                        <p className={`artwork-preview-status ${artwork.status === 'available' ? 'available' : 'sold'}`}>
                          {artwork.status}
                        </p>
                        <p className="artwork-preview-price">${artwork.price}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No artworks yet. Start creating!</p>
                )}
              </div>
              <div className="view-all-link">
                <a href="/artworks" className="view-all-btn">View All Artworks</a>
              </div>
            </div>

            {/* Recent Orders */}
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
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No orders yet.</p>
                )}
              </div>
              <div className="view-all-link">
                <a href="/orders" className="view-all-btn">View All Orders</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
