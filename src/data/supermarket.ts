export interface SupermarketProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'fruits' | 'vegetables' | 'bakery' | 'beverages' | 'spices' | 'dairy' | 'meat' | 'pantry';
  stock: number;
  unit: string;
  onSale?: boolean;
  originalPrice?: number;
}

export const supermarketProducts: SupermarketProduct[] = [
  // Fruits
  {
    id: 'bananas',
    name: 'Fresh Bananas',
    description: 'Sweet and ripe bananas, perfect for breakfast',
    price: 247,
    image: '/products/fruits.svg',
    category: 'fruits',
    stock: 50,
    unit: 'per bunch',
  },
  {
    id: 'strawberries',
    name: 'Organic Strawberries',
    description: 'Fresh organic strawberries, locally sourced',
    price: 412,
    originalPrice: 577,
    onSale: true,
    image: '/products/fruits.svg',
    category: 'fruits',
    stock: 25,
    unit: 'per container',
  },
  {
    id: 'avocados',
    name: 'Hass Avocados',
    description: 'Creamy and perfectly ripe avocados',
    price: 164,
    image: '/products/fruits.svg',
    category: 'fruits',
    stock: 40,
    unit: 'each',
  },
  
  // Vegetables
  {
    id: 'tomatoes',
    name: 'Roma Tomatoes',
    description: 'Fresh Roma tomatoes, great for cooking',
    price: 288,
    image: '/products/vegetables.svg',
    category: 'vegetables',
    stock: 30,
    unit: 'per lb',
  },
  {
    id: 'spinach',
    name: 'Baby Spinach',
    description: 'Fresh baby spinach leaves',
    price: 329,
    image: '/products/vegetables.svg',
    category: 'vegetables',
    stock: 20,
    unit: 'per bag',
  },
  
  // Dairy
  {
    id: 'milk',
    name: 'Whole Milk',
    description: 'Fresh whole milk, 1 gallon',
    price: 354,
    image: '/products/dairy.svg',
    category: 'dairy',
    stock: 15,
    unit: 'per gallon',
  },
  {
    id: 'eggs',
    name: 'Large Eggs',
    description: 'Grade A large eggs, dozen',
    price: 329,
    image: '/products/dairy.svg',
    category: 'dairy',
    stock: 25,
    unit: 'per dozen',
  },
  {
    id: 'cheese-cheddar',
    name: 'Sharp Cheddar Cheese',
    description: 'Aged sharp cheddar cheese',
    price: 494,
    image: '/products/dairy.svg',
    category: 'dairy',
    stock: 12,
    unit: 'per block',
  },
  
  // Meat
  {
    id: 'chicken-breast',
    name: 'Chicken Breast',
    description: 'Boneless, skinless chicken breast',
    price: 659,
    image: '/products/meat.svg',
    category: 'meat',
    stock: 18,
    unit: 'per lb',
  },
  {
    id: 'ground-beef',
    name: 'Ground Beef',
    description: 'Fresh ground beef, 80/20',
    price: 576,
    image: '/products/meat.svg',
    category: 'meat',
    stock: 22,
    unit: 'per lb',
  },
  
  // Bakery
  {
    id: 'sourdough-bread',
    name: 'Sourdough Bread',
    description: 'Artisan sourdough bread, freshly baked',
    price: 412,
    image: '/products/bakery.svg',
    category: 'bakery',
    stock: 8,
    unit: 'per loaf',
  },
  
  // Pantry
  {
    id: 'pasta-spaghetti',
    name: 'Spaghetti Pasta',
    description: 'Premium Italian spaghetti pasta',
    price: 247,
    image: '/products/pantry.svg',
    category: 'pantry',
    stock: 35,
    unit: 'per box',
  },
  {
    id: 'olive-oil',
    name: 'Extra Virgin Olive Oil',
    description: 'Cold-pressed extra virgin olive oil',
    price: 742,
    image: '/products/pantry.svg',
    category: 'pantry',
    stock: 12,
    unit: 'per bottle',
  },
  
  // Spices
  {
    id: 'black-pepper',
    name: 'Black Pepper',
    description: 'Freshly ground black pepper',
    price: 329,
    image: '/products/spices.svg',
    category: 'spices',
    stock: 15,
    unit: 'per container',
  },
  {
    id: 'sea-salt',
    name: 'Sea Salt',
    description: 'Premium sea salt',
    price: 247,
    image: '/products/spices.svg',
    category: 'spices',
    stock: 20,
    unit: 'per container',
  },
];

export const getProductsByCategory = (category: string) => {
  return supermarketProducts.filter(product => product.category === category);
};

export const getProductById = (id: string) => {
  return supermarketProducts.find(product => product.id === id);
};

export const categories = [
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥬' },
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'meat', name: 'Meat', icon: '🥩' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'pantry', name: 'Pantry', icon: '🥫' },
  { id: 'spices', name: 'Spices', icon: '🧄' },
  { id: 'beverages', name: 'Beverages', icon: '🥤' },
];