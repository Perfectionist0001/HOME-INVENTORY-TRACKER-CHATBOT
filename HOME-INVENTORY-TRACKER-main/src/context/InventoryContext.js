import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultInventory } from '../data/defaultData';

const InventoryContext = createContext();
export const useInventory = () => useContext(InventoryContext);

const loadLS = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

export const InventoryProvider = ({ children }) => {
  // Multi-user
  const [users, setUsers] = useState(() => loadLS('inv_users', [{ id: 1, name: 'Me', avatar: '👤' }]));
  const [activeUserId, setActiveUserId] = useState(() => loadLS('inv_activeUser', 1));

  // Inventory per user
  const [allInventories, setAllInventories] = useState(() =>
    loadLS('inv_all', { 1: defaultInventory })
  );
  const inventory = allInventories[activeUserId] || defaultInventory;

  // Usage history: { itemId: [{ date, qty }] }
  const [usageHistory, setUsageHistory] = useState(() => loadLS('inv_usage', {}));

  // Shopping list
  const [shoppingList, setShoppingList] = useState(() => loadLS('inv_shopping', []));

  // Budget
  const [budget, setBudget] = useState(() => loadLS('inv_budget', { monthly: 5000, spent: 0, history: [] }));

  // Notifications
  const [notifications, setNotifications] = useState(() => loadLS('inv_notifs', []));

  // Persist
  useEffect(() => { localStorage.setItem('inv_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('inv_activeUser', JSON.stringify(activeUserId)); }, [activeUserId]);
  useEffect(() => { localStorage.setItem('inv_all', JSON.stringify(allInventories)); }, [allInventories]);
  useEffect(() => { localStorage.setItem('inv_usage', JSON.stringify(usageHistory)); }, [usageHistory]);
  useEffect(() => { localStorage.setItem('inv_shopping', JSON.stringify(shoppingList)); }, [shoppingList]);
  useEffect(() => { localStorage.setItem('inv_budget', JSON.stringify(budget)); }, [budget]);
  useEffect(() => { localStorage.setItem('inv_notifs', JSON.stringify(notifications)); }, [notifications]);

  const setInventory = (updater) => {
    setAllInventories(prev => ({
      ...prev,
      [activeUserId]: typeof updater === 'function' ? updater(prev[activeUserId] || defaultInventory) : updater
    }));
  };

  // ── Inventory CRUD ──
  const addItem = (item) => {
    const category = item.category;
    setInventory(prev => ({
      ...prev,
      [category]: [...(prev[category] || []), { ...item, id: Date.now() }]
    }));
    addNotification(`Added "${item.name}" to ${category}`, 'success');
  };

  const updateItem = (item, oldCategory) => {
    setInventory(prev => {
      // Track usage before updating (using prev which is always fresh)
      const srcCategory = oldCategory || item.category;
      const oldItem = (prev[srcCategory] || []).find(i => i.id === item.id);
      if (oldItem && oldItem.quantity !== item.quantity) {
        const diff = oldItem.quantity - item.quantity;
        if (diff > 0) {
          setUsageHistory(h => ({
            ...h,
            [item.id]: [...(h[item.id] || []), { date: new Date().toISOString(), qty: diff }]
          }));
        }
      }

      if (oldCategory && oldCategory !== item.category) {
        return {
          ...prev,
          [oldCategory]: (prev[oldCategory] || []).filter(i => i.id !== item.id),
          [item.category]: [...(prev[item.category] || []), item]
        };
      }
      return {
        ...prev,
        [item.category]: (prev[item.category] || []).map(i => i.id === item.id ? item : i)
      };
    });
  };

  const deleteItem = (itemId, category) => {
    setInventory(prev => ({
      ...prev,
      [category]: (prev[category] || []).filter(item => item.id !== itemId)
    }));
  };

  const addCategory = (categoryName) => {
    const key = categoryName.toLowerCase().trim();
    setInventory(prev => prev[key] ? prev : { ...prev, [key]: [] });
  };

  // ── Low Stock ──
  const getLowStockItems = useCallback(() => {
    const lowStock = [];
    Object.keys(inventory).forEach(cat => {
      (inventory[cat] || []).forEach(item => {
        if (item.quantity <= item.threshold) lowStock.push(item);
      });
    });
    return lowStock;
  }, [inventory]);

  // ── Expiry ──
  const getExpiringItems = useCallback((days = 7) => {
    const result = [];
    Object.values(inventory).flat().forEach(item => {
      if (item.expiryDate) {
        const daysLeft = Math.ceil((new Date(item.expiryDate) - new Date()) / 86400000);
        if (daysLeft <= days) result.push({ ...item, daysLeft });
      }
    });
    return result.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [inventory]);

  // ── Usage Tracking ──
  const trackUsage = (itemId, qty) => {
    setUsageHistory(prev => ({
      ...prev,
      [itemId]: [...(prev[itemId] || []), { date: new Date().toISOString(), qty }]
    }));
  };

  const getUsagePrediction = useCallback((itemId) => {
    const history = usageHistory[itemId] || [];
    if (history.length < 2) return null;
    const recent = history.slice(-10);
    const totalQty = recent.reduce((s, e) => s + e.qty, 0);
    const days = Math.max(1, Math.ceil(
      (new Date(recent[recent.length - 1].date) - new Date(recent[0].date)) / 86400000
    ));
    const dailyRate = totalQty / days;
    const item = Object.values(inventory).flat().find(i => i.id === itemId);
    if (!item || dailyRate === 0) return null;
    const daysLeft = Math.floor(item.quantity / dailyRate);
    return { dailyRate: dailyRate.toFixed(2), daysLeft, suggestedQty: Math.ceil(dailyRate * 14) };
  }, [usageHistory, inventory]);

  // ── Shopping List ──
  const addToShoppingList = (item) => {
    setShoppingList(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? { ...i, needed: item.needed || i.needed } : i);
      return [...prev, { ...item, needed: item.needed || item.threshold * 2, checked: false, estimatedCost: item.estimatedCost || 0 }];
    });
  };

  const toggleShoppingItem = (id) => {
    setShoppingList(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  };

  const removeFromShoppingList = (id) => {
    setShoppingList(prev => prev.filter(i => i.id !== id));
  };

  const clearShoppingList = () => setShoppingList([]);

  const autoGenerateShoppingList = () => {
    const low = getLowStockItems();
    if (low.length === 0) return;
    setShoppingList(prev => {
      let updated = [...prev];
      low.forEach(item => {
        const needed = Math.max(1, item.threshold * 2 - item.quantity);
        const exists = updated.find(i => i.id === item.id);
        if (exists) {
          updated = updated.map(i => i.id === item.id ? { ...i, needed } : i);
        } else {
          updated = [...updated, { ...item, needed, checked: false, estimatedCost: item.estimatedCost || 0 }];
        }
      });
      return updated;
    });
  };

  // ── Budget ──
  const updateBudget = (monthly) => setBudget(prev => ({ ...prev, monthly }));

  const addExpense = (amount, label) => {
    setBudget(prev => ({
      ...prev,
      spent: prev.spent + amount,
      history: [...prev.history, { date: new Date().toISOString(), amount, label }]
    }));
  };

  // ── Notifications ──
  const addNotification = (message, type = 'info') => {
    const notif = { id: Date.now(), message, type, time: new Date().toISOString(), read: false };
    setNotifications(prev => [notif, ...prev].slice(0, 50));
  };

  const markNotifRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const clearNotifications = () => setNotifications([]);

  // ── Multi-user ──
  const addUser = (name, avatar = '👤') => {
    const id = Date.now();
    setUsers(prev => [...prev, { id, name, avatar }]);
    setAllInventories(prev => ({ ...prev, [id]: defaultInventory }));
    return id;
  };

  const switchUser = (id) => setActiveUserId(id);
  const activeUser = users.find(u => u.id === activeUserId) || users[0];

  return (
    <InventoryContext.Provider value={{
      inventory, addItem, updateItem, deleteItem, addCategory,
      getLowStockItems, getExpiringItems,
      usageHistory, trackUsage, getUsagePrediction,
      shoppingList, addToShoppingList, toggleShoppingItem, removeFromShoppingList, clearShoppingList, autoGenerateShoppingList,
      budget, updateBudget, addExpense,
      notifications, addNotification, markNotifRead, clearNotifications,
      users, activeUser, activeUserId, addUser, switchUser,
    }}>
      {children}
    </InventoryContext.Provider>
  );
};
