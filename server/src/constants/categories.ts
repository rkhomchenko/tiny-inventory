export const ProductCategories = {
  ELECTRONICS: 'Electronics',
  CLOTHING: 'Clothing',
  FOOD: 'Food',
  BOOKS: 'Books',
  HOME: 'Home',
} as const;

export type ProductCategory = typeof ProductCategories[keyof typeof ProductCategories];

export const PRODUCT_CATEGORY_VALUES = Object.values(ProductCategories);
