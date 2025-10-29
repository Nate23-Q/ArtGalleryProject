import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import '../styles/pages/Orders.css';

export default function Orders() {
  const { role } = useAuth();
  const location = useLocation();
  const { orders, updateOrderStatus } = useOrders();
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // No need for fetchOrders since we're using localStorage via context

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'processing': return '#3b82f6';
      case 'shipped': return '#10b981';
      case 'delivered': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h1 className="orders-title">
            {role === 'Artist' ? 'Order Management' : 'My Orders'}
          </h1>
          <p className="orders-subtitle">
            {role === 'Artist'
              ? 'Manage orders for your artworks'
              : 'Track your purchases and order history'
            }
          </p>
        </div>

        {/* Filter */}
        <div className="orders-filter">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Orders List */}
        <div className="orders-list">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3 className="order-id">Order #{order.id}</h3>
                    <p className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-status">
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className="order-items">
                  <div className="order-item">
                    <img
                      src={order.artwork.imageUrl}
                      alt={order.artwork.title}
                      className="order-item-image"
                      onError={(e) => {
                        e.target.src = '/placeholder-artwork.png';
                      }}
                    />
                    <div className="order-item-details">
                      <h4 className="order-item-title">{order.artwork.title}</h4>
                      <p className="order-item-artist">{order.artwork.artist}</p>
                      <p className="order-item-category">{order.artwork.category}</p>
                      <p className="order-item-price">${order.artwork.price}</p>
                    </div>
                  </div>
                </div>

                <div className="order-footer">
                  <div className="order-total">
                    Total: ${order.artwork.price}
                  </div>
                  {role === 'Artist' && order.status === 'pending' && (
                    <div className="order-actions">
                      <button
                        onClick={() => updateOrderStatus(order.id, 'processing')}
                        className="btn-secondary"
                      >
                        Accept Order
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="btn-danger"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                  {role === 'Artist' && order.status === 'processing' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'shipped')}
                      className="btn-primary"
                    >
                      Mark as Shipped
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-orders">
              <h2 className="no-orders-title">No orders found</h2>
              <p className="no-orders-text">
                {filter === 'all'
                  ? (role === 'Artist' ? 'No orders have been placed for your artworks yet.' : 'You haven\'t placed any orders yet.')
                  : `No ${filter} orders found.`
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
