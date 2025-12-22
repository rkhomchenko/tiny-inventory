export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'Electronics',
  CLOTHING: 'Clothing',
  FOOD: 'Food',
  BOOKS: 'Books',
  HOME: 'Home',
} as const;

export type ProductCategory = typeof PRODUCT_CATEGORIES[keyof typeof PRODUCT_CATEGORIES];
