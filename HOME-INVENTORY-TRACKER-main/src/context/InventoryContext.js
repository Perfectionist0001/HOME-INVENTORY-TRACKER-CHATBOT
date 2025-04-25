import React, { createContext, useContext, useState, useEffect } from 'react';
import { defaultInventory } from '../data/defaultData';

const InventoryContext = createContext();

export const useInventory = () => useContext(InventoryContext);

export const InventoryProvider = ({ children }) => {
  const [inventory, setInventory] = useState(() => {
    const savedInventory = localStorage.getItem('inventory');
    return savedInventory ? JSON.parse(savedInventory) : defaultInventory;
  });

  useEffect(() => {
    localStorage.setItem('inventory', JSON.stringify(inventory));
  }, [inventory]);

  const addItem = (item) => {
    const category = item.category;
    setInventory(prev => ({
      ...prev,
      [category]: [...prev[category], { ...item, id: Date.now() }]
    }));
  };

  const updateItem = (item) => {
    const category = item.category;
    setInventory(prev => ({
      ...prev,
      [category]: prev[category].map(i => i.id === item.id ? item : i)
    }));
  };

  const deleteItem = (itemId, category) => {
    setInventory(prev => ({
      ...prev,
      [category]: prev[category].filter(item => item.id !== itemId)
    }));
  };

  const getLowStockItems = () => {
    const lowStock = [];
    Object.keys(inventory).forEach(category => {
      inventory[category].forEach(item => {
        if (item.quantity <= item.threshold) {
          lowStock.push(item);
        }
      });
    });
    return lowStock;
  };

  return (
    <InventoryContext.Provider value={{
      inventory,
      addItem,
      updateItem,
      deleteItem,
      getLowStockItems
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
