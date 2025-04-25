export const categoryIcons = {
  groceries: 'local_grocery_store',
  cleaning: 'cleaning_services',
  electronics: 'electrical_services'
};

export const defaultInventory = {
  groceries: [
    { id: 1, name: "Rice", quantity: 2, unit: "kg", threshold: 1, category: "groceries" },
    { id: 2, name: "Flour", quantity: 1.5, unit: "kg", threshold: 1, category: "groceries" },
    { id: 3, name: "Sugar", quantity: 0.5, unit: "kg", threshold: 1, category: "groceries" },
    { id: 4, name: "Salt", quantity: 0.8, unit: "kg", threshold: 0.5, category: "groceries" }
  ],
  cleaning: [
    { id: 5, name: "Dish Soap", quantity: 1, unit: "bottle", threshold: 1, category: "cleaning" },
    { id: 6, name: "Laundry Detergent", quantity: 2, unit: "bottle", threshold: 1, category: "cleaning" },
    { id: 7, name: "Floor Cleaner", quantity: 0.2, unit: "bottle", threshold: 1, category: "cleaning" }
  ],
  electronics: [
    { id: 8, name: "Light Bulbs", quantity: 3, unit: "pieces", threshold: 2, category: "electronics" },
    { id: 9, name: "Batteries AA", quantity: 4, unit: "pieces", threshold: 4, category: "electronics" },
    { id: 10, name: "Batteries AAA", quantity: 2, unit: "pieces", threshold: 4, category: "electronics" }
  ]
};
