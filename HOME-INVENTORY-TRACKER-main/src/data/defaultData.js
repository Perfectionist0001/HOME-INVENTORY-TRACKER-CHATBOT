export const categoryIcons = {
  groceries: 'local_grocery_store',
  cleaning: 'cleaning_services',
  electronics: 'electrical_services',
  beverages: 'local_bar',
  personal: 'person',
  medicine: 'medical_services',
};

const d = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

export const defaultInventory = {
  groceries: [
    { id: 1, name: 'Rice', quantity: 2, unit: 'kg', threshold: 1, category: 'groceries', expiryDate: d(180), estimatedCost: 80 },
    { id: 2, name: 'Flour', quantity: 1.5, unit: 'kg', threshold: 1, category: 'groceries', expiryDate: d(90), estimatedCost: 50 },
    { id: 3, name: 'Sugar', quantity: 0.5, unit: 'kg', threshold: 1, category: 'groceries', expiryDate: d(365), estimatedCost: 45 },
    { id: 4, name: 'Salt', quantity: 0.8, unit: 'kg', threshold: 0.5, category: 'groceries', expiryDate: d(730), estimatedCost: 20 },
    { id: 5, name: 'Milk', quantity: 1, unit: 'litre', threshold: 2, category: 'groceries', expiryDate: d(3), estimatedCost: 60 },
    { id: 6, name: 'Bread', quantity: 1, unit: 'loaf', threshold: 1, category: 'groceries', expiryDate: d(2), estimatedCost: 40 },
    { id: 7, name: 'Eggs', quantity: 6, unit: 'pcs', threshold: 6, category: 'groceries', expiryDate: d(14), estimatedCost: 90 },
  ],
  cleaning: [
    { id: 8, name: 'Dish Soap', quantity: 1, unit: 'bottle', threshold: 1, category: 'cleaning', expiryDate: null, estimatedCost: 55 },
    { id: 9, name: 'Laundry Detergent', quantity: 2, unit: 'bottle', threshold: 1, category: 'cleaning', expiryDate: null, estimatedCost: 200 },
    { id: 10, name: 'Floor Cleaner', quantity: 0.2, unit: 'bottle', threshold: 1, category: 'cleaning', expiryDate: null, estimatedCost: 120 },
  ],
  electronics: [
    { id: 11, name: 'Light Bulbs', quantity: 3, unit: 'pcs', threshold: 2, category: 'electronics', expiryDate: null, estimatedCost: 150 },
    { id: 12, name: 'Batteries AA', quantity: 4, unit: 'pcs', threshold: 4, category: 'electronics', expiryDate: null, estimatedCost: 80 },
    { id: 13, name: 'Batteries AAA', quantity: 2, unit: 'pcs', threshold: 4, category: 'electronics', expiryDate: null, estimatedCost: 80 },
  ],
};
