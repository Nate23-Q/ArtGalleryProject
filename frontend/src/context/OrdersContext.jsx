import React, { createContext, useContext, useState, useEffect } from 'react';

const OrdersContext = createContext();

export const useOrders = () => {
  return useContext(OrdersContext);
};

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);

  // Load orders from localStorage on mount
  useEffect(() => {
    const storedOrders = localStorage.getItem('orders');
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    }
  }, []);

  // Save orders to localStorage whenever orders change
  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const addOrder = (artwork) => {
    const newOrder = {
      id: Date.now().toString(),
      artwork,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setOrders(prevOrders => [...prevOrders, newOrder]);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const value = {
    orders,
    addOrder,
    updateOrderStatus,
  };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
};
