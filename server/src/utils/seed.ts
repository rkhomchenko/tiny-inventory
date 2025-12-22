import { DatabaseService } from '../config/database.js';
import { Store } from '../entities/Store.entity.js';
import { Product } from '../entities/Product.entity.js';
import { Inventory } from '../entities/Inventory.entity.js';
import { logger } from './logger.js';
import { ProductCategories } from '../constants/categories.js';

const stores = [
  { name: 'Downtown Electronics', address: '123 Main St, New York, NY 10001' },
  { name: 'Westside Mart', address: '456 West Ave, Los Angeles, CA 90001' },
  { name: 'Central Supply Co', address: '789 Central Blvd, Chicago, IL 60601' },
  { name: 'Tech Haven', address: '321 Innovation Dr, San Francisco, CA 94102' },
  { name: 'Metro Store', address: '654 Metro Plaza, Austin, TX 73301' },
  { name: 'Northside Market', address: '234 North Park Ave, Seattle, WA 98101' },
  { name: 'Eastside Trading', address: '567 East Main, Boston, MA 02101' },
  { name: 'Southpoint Supply', address: '890 South Street, Miami, FL 33101' },
  { name: 'Westgate Emporium', address: '432 West Gate Blvd, Denver, CO 80201' },
  { name: 'Urban Essentials', address: '765 Urban Plaza, Portland, OR 97201' },
  { name: 'Riverside Retail', address: '198 River Road, Nashville, TN 37201' },
  { name: 'Summit Store', address: '321 Summit Ave, Phoenix, AZ 85001' },
  { name: 'Lakeside Marketplace', address: '654 Lake Shore Dr, Detroit, MI 48201' },
  { name: 'Midtown Merchants', address: '987 Midtown Blvd, Atlanta, GA 30301' },
  { name: 'Bayside Boutique', address: '210 Bay Street, San Diego, CA 92101' },
  { name: 'Parkside Provisions', address: '543 Park Avenue, Philadelphia, PA 19101' },
  { name: 'Harbor House', address: '876 Harbor Lane, Baltimore, MD 21201' },
  { name: 'Gateway Goods', address: '109 Gateway Plaza, St Louis, MO 63101' },
  { name: 'Skyline Shopping', address: '432 Skyline Drive, Dallas, TX 75201' },
  { name: 'Mountain View Market', address: '765 Mountain View Rd, Salt Lake City, UT 84101' },
];

const products = [
  // Electronics (20 products)
  { name: 'iPhone 15 Pro', category: ProductCategories.ELECTRONICS, price: 999.99, description: 'Latest Apple smartphone' },
  { name: 'Samsung Galaxy S24', category: ProductCategories.ELECTRONICS, price: 899.99, description: 'Premium Android phone' },
  { name: 'MacBook Air M3', category: ProductCategories.ELECTRONICS, price: 1299.99, description: 'Lightweight laptop' },
  { name: 'Dell XPS 15', category: ProductCategories.ELECTRONICS, price: 1499.99, description: 'High-performance laptop' },
  { name: 'Sony WH-1000XM5', category: ProductCategories.ELECTRONICS, price: 399.99, description: 'Noise-canceling headphones' },
  { name: 'iPad Pro 12.9', category: ProductCategories.ELECTRONICS, price: 1099.99, description: 'Professional tablet' },
  { name: 'AirPods Pro 2', category: ProductCategories.ELECTRONICS, price: 249.99, description: 'Wireless earbuds' },
  { name: 'Apple Watch Series 9', category: ProductCategories.ELECTRONICS, price: 429.99, description: 'Smart watch' },
  { name: 'Google Pixel 8', category: ProductCategories.ELECTRONICS, price: 699.99, description: 'Google smartphone' },
  { name: 'Kindle Paperwhite', category: ProductCategories.ELECTRONICS, price: 149.99, description: 'E-reader device' },
  { name: 'LG OLED TV 55"', category: ProductCategories.ELECTRONICS, price: 1799.99, description: '4K OLED television' },
  { name: 'PlayStation 5', category: ProductCategories.ELECTRONICS, price: 499.99, description: 'Gaming console' },
  { name: 'Xbox Series X', category: ProductCategories.ELECTRONICS, price: 499.99, description: 'Gaming console' },
  { name: 'Nintendo Switch OLED', category: ProductCategories.ELECTRONICS, price: 349.99, description: 'Hybrid gaming console' },
  { name: 'Canon EOS R6', category: ProductCategories.ELECTRONICS, price: 2499.99, description: 'Mirrorless camera' },
  { name: 'GoPro Hero 12', category: ProductCategories.ELECTRONICS, price: 399.99, description: 'Action camera' },
  { name: 'Bose SoundLink', category: ProductCategories.ELECTRONICS, price: 179.99, description: 'Bluetooth speaker' },
  { name: 'Logitech MX Master 3', category: ProductCategories.ELECTRONICS, price: 99.99, description: 'Wireless mouse' },
  { name: 'Mechanical Keyboard RGB', category: ProductCategories.ELECTRONICS, price: 149.99, description: 'Gaming keyboard' },
  { name: 'Webcam 4K Pro', category: ProductCategories.ELECTRONICS, price: 199.99, description: 'Professional webcam' },

  // Clothing (20 products)
  { name: 'Levi\'s 501 Jeans', category: ProductCategories.CLOTHING, price: 79.99, description: 'Classic denim jeans' },
  { name: 'Nike Air Max', category: ProductCategories.CLOTHING, price: 129.99, description: 'Athletic sneakers' },
  { name: 'Patagonia Fleece', category: ProductCategories.CLOTHING, price: 149.99, description: 'Outdoor fleece jacket' },
  { name: 'Adidas Hoodie', category: ProductCategories.CLOTHING, price: 59.99, description: 'Comfortable hoodie' },
  { name: 'North Face Parka', category: ProductCategories.CLOTHING, price: 299.99, description: 'Winter jacket' },
  { name: 'Columbia Rain Jacket', category: ProductCategories.CLOTHING, price: 89.99, description: 'Waterproof jacket' },
  { name: 'Under Armour Shirt', category: ProductCategories.CLOTHING, price: 34.99, description: 'Performance t-shirt' },
  { name: 'Reebok Training Shorts', category: ProductCategories.CLOTHING, price: 29.99, description: 'Athletic shorts' },
  { name: 'New Balance 990', category: ProductCategories.CLOTHING, price: 184.99, description: 'Running shoes' },
  { name: 'Vans Classic Slip-On', category: ProductCategories.CLOTHING, price: 54.99, description: 'Casual shoes' },
  { name: 'Carhartt Beanie', category: ProductCategories.CLOTHING, price: 19.99, description: 'Winter hat' },
  { name: 'Ray-Ban Aviators', category: ProductCategories.CLOTHING, price: 159.99, description: 'Sunglasses' },
  { name: 'Timex Weekender Watch', category: ProductCategories.CLOTHING, price: 44.99, description: 'Casual watch' },
  { name: 'Leather Belt Brown', category: ProductCategories.CLOTHING, price: 39.99, description: 'Genuine leather belt' },
  { name: 'Wool Socks 3-Pack', category: ProductCategories.CLOTHING, price: 24.99, description: 'Merino wool socks' },
  { name: 'Champion Sweatpants', category: ProductCategories.CLOTHING, price: 44.99, description: 'Fleece sweatpants' },
  { name: 'Tommy Hilfiger Polo', category: ProductCategories.CLOTHING, price: 69.99, description: 'Classic polo shirt' },
  { name: 'Calvin Klein Underwear 3pk', category: ProductCategories.CLOTHING, price: 39.99, description: 'Cotton underwear' },
  { name: 'Patagonia Cap', category: ProductCategories.CLOTHING, price: 29.99, description: 'Baseball cap' },
  { name: 'Scarf Cashmere', category: ProductCategories.CLOTHING, price: 79.99, description: 'Soft cashmere scarf' },

  // Food & Beverage (20 products)
  { name: 'Organic Coffee Beans', category: ProductCategories.FOOD, price: 15.99, description: '1lb premium coffee' },
  { name: 'Green Tea Set', category: ProductCategories.FOOD, price: 24.99, description: 'Assorted green teas' },
  { name: 'Protein Bars (12pk)', category: ProductCategories.FOOD, price: 19.99, description: 'Healthy snack bars' },
  { name: 'Olive Oil', category: ProductCategories.FOOD, price: 12.99, description: 'Extra virgin olive oil' },
  { name: 'Honey Raw Organic', category: ProductCategories.FOOD, price: 18.99, description: 'Unfiltered honey' },
  { name: 'Almond Butter', category: ProductCategories.FOOD, price: 14.99, description: 'Natural almond butter' },
  { name: 'Granola Premium Mix', category: ProductCategories.FOOD, price: 9.99, description: 'Artisan granola' },
  { name: 'Dark Chocolate Bar', category: ProductCategories.FOOD, price: 6.99, description: '85% cacao chocolate' },
  { name: 'Pasta Organic', category: ProductCategories.FOOD, price: 4.99, description: 'Italian pasta' },
  { name: 'Marinara Sauce', category: ProductCategories.FOOD, price: 7.99, description: 'Homemade style sauce' },
  { name: 'Quinoa Organic', category: ProductCategories.FOOD, price: 11.99, description: 'Whole grain quinoa' },
  { name: 'Coconut Oil', category: ProductCategories.FOOD, price: 13.99, description: 'Virgin coconut oil' },
  { name: 'Trail Mix', category: ProductCategories.FOOD, price: 8.99, description: 'Nuts and dried fruit' },
  { name: 'Kombucha 6-Pack', category: ProductCategories.FOOD, price: 18.99, description: 'Probiotic drink' },
  { name: 'Matcha Powder', category: ProductCategories.FOOD, price: 24.99, description: 'Japanese green tea powder' },
  { name: 'Maple Syrup', category: ProductCategories.FOOD, price: 16.99, description: 'Pure maple syrup' },
  { name: 'Sea Salt Himalayan', category: ProductCategories.FOOD, price: 9.99, description: 'Pink salt grinder' },
  { name: 'Balsamic Vinegar', category: ProductCategories.FOOD, price: 14.99, description: 'Aged balsamic' },
  { name: 'Chia Seeds', category: ProductCategories.FOOD, price: 10.99, description: 'Organic chia seeds' },
  { name: 'Rice Cakes', category: ProductCategories.FOOD, price: 5.99, description: 'Lightly salted' },

  // Books (20 products)
  { name: 'The Pragmatic Programmer', category: ProductCategories.BOOKS, price: 44.99, description: 'Programming best practices' },
  { name: 'Clean Code', category: ProductCategories.BOOKS, price: 39.99, description: 'Code craftsmanship' },
  { name: 'Atomic Habits', category: ProductCategories.BOOKS, price: 16.99, description: 'Building better habits' },
  { name: 'Deep Work', category: ProductCategories.BOOKS, price: 18.99, description: 'Focus and productivity' },
  { name: 'Thinking, Fast and Slow', category: ProductCategories.BOOKS, price: 19.99, description: 'Behavioral economics' },
  { name: 'Sapiens', category: ProductCategories.BOOKS, price: 24.99, description: 'Human history' },
  { name: 'Educated', category: ProductCategories.BOOKS, price: 17.99, description: 'Memoir' },
  { name: 'The Lean Startup', category: ProductCategories.BOOKS, price: 21.99, description: 'Entrepreneurship' },
  { name: 'Zero to One', category: ProductCategories.BOOKS, price: 18.99, description: 'Startup innovation' },
  { name: 'Design Patterns', category: ProductCategories.BOOKS, price: 54.99, description: 'Software architecture' },
  { name: 'Refactoring', category: ProductCategories.BOOKS, price: 49.99, description: 'Code improvement' },
  { name: 'You Don\'t Know JS', category: ProductCategories.BOOKS, price: 29.99, description: 'JavaScript deep dive' },
  { name: 'Eloquent JavaScript', category: ProductCategories.BOOKS, price: 34.99, description: 'Modern JS guide' },
  { name: 'The DevOps Handbook', category: ProductCategories.BOOKS, price: 39.99, description: 'DevOps practices' },
  { name: 'Site Reliability Engineering', category: ProductCategories.BOOKS, price: 44.99, description: 'Google SRE book' },
  { name: 'Grokking Algorithms', category: ProductCategories.BOOKS, price: 39.99, description: 'Algorithm basics' },
  { name: 'Cracking the Coding Interview', category: ProductCategories.BOOKS, price: 49.99, description: 'Interview prep' },
  { name: 'The Phoenix Project', category: ProductCategories.BOOKS, price: 24.99, description: 'DevOps novel' },
  { name: 'Designing Data-Intensive Applications', category: ProductCategories.BOOKS, price: 59.99, description: 'Distributed systems' },
  { name: 'Domain-Driven Design', category: ProductCategories.BOOKS, price: 54.99, description: 'Software modeling' },

  // Home & Garden (20 products)
  { name: 'Plant Starter Kit', category: ProductCategories.HOME, price: 34.99, description: 'Indoor plant kit' },
  { name: 'Tool Set', category: ProductCategories.HOME, price: 89.99, description: '50-piece tool set' },
  { name: 'Vacuum Cleaner Robot', category: ProductCategories.HOME, price: 299.99, description: 'Smart vacuum' },
  { name: 'Air Purifier HEPA', category: ProductCategories.HOME, price: 199.99, description: 'Room air purifier' },
  { name: 'Desk Lamp LED', category: ProductCategories.HOME, price: 49.99, description: 'Adjustable desk lamp' },
  { name: 'Ergonomic Office Chair', category: ProductCategories.HOME, price: 349.99, description: 'Mesh office chair' },
  { name: 'Standing Desk', category: ProductCategories.HOME, price: 499.99, description: 'Electric adjustable desk' },
  { name: 'Coffee Maker', category: ProductCategories.HOME, price: 129.99, description: 'Programmable coffee maker' },
  { name: 'Blender High-Speed', category: ProductCategories.HOME, price: 89.99, description: 'Smoothie blender' },
  { name: 'Cookware Set', category: ProductCategories.HOME, price: 199.99, description: 'Non-stick pots and pans' },
  { name: 'Knife Set Professional', category: ProductCategories.HOME, price: 149.99, description: 'Chef knife set' },
  { name: 'Bath Towel Set', category: ProductCategories.HOME, price: 59.99, description: '6-piece cotton towels' },
  { name: 'Bedding Set Queen', category: ProductCategories.HOME, price: 89.99, description: 'Sheets and pillowcases' },
  { name: 'Throw Pillows 2-Pack', category: ProductCategories.HOME, price: 34.99, description: 'Decorative cushions' },
  { name: 'Area Rug 5x7', category: ProductCategories.HOME, price: 159.99, description: 'Modern design rug' },
  { name: 'Mirror Wall-Mount', category: ProductCategories.HOME, price: 79.99, description: 'Full-length mirror' },
  { name: 'Storage Bins 6-Pack', category: ProductCategories.HOME, price: 44.99, description: 'Fabric storage cubes' },
  { name: 'Laundry Hamper', category: ProductCategories.HOME, price: 29.99, description: 'Collapsible hamper' },
  { name: 'Garden Hose 50ft', category: ProductCategories.HOME, price: 39.99, description: 'Heavy-duty hose' },
  { name: 'Fire Extinguisher', category: ProductCategories.HOME, price: 49.99, description: 'Multi-purpose extinguisher' },
];

async function seed() {
  try {
    logger.info('Starting database seeding...');

    // Initialize database
    const orm = await DatabaseService.init();
    const em = orm.em.fork();

    // Clear existing data
    logger.info('Clearing existing data...');
    await em.nativeDelete(Inventory, {});
    await em.nativeDelete(Product, {});
    await em.nativeDelete(Store, {});

    // Create stores
    logger.info('Creating stores...');
    const createdStores: Store[] = [];
    for (const storeData of stores) {
      const store = em.create(Store, storeData);
      createdStores.push(store);
    }
    await em.persistAndFlush(createdStores);
    logger.info(`Created ${createdStores.length} stores`);

    // Create products
    logger.info('Creating products...');
    const createdProducts: Product[] = [];
    for (const productData of products) {
      const product = em.create(Product, productData);
      createdProducts.push(product);
    }
    await em.persistAndFlush(createdProducts);
    logger.info(`Created ${createdProducts.length} products`);

    // Create inventory entries (distribute products across stores)
    logger.info('Creating inventory entries...');
    const inventoryEntries: Inventory[] = [];

    // Each store gets a random selection of products
    for (const store of createdStores) {
      // Randomly select 15-30 products for each store (out of 100 available)
      const numProducts = Math.floor(Math.random() * 16) + 15; // 15-30 products
      const shuffled = [...createdProducts].sort(() => 0.5 - Math.random());
      const selectedProducts = shuffled.slice(0, numProducts);

      for (const product of selectedProducts) {
        // Random quantity between 5 and 200
        const quantity = Math.floor(Math.random() * 196) + 5;

        const inventory = em.create(Inventory, {
          store,
          product,
          quantity,
        });
        inventoryEntries.push(inventory);
      }
    }

    await em.persistAndFlush(inventoryEntries);
    logger.info(`Created ${inventoryEntries.length} inventory entries`);

    logger.info('Database seeding completed successfully!');
    logger.info('Summary:');
    logger.info(`  - Stores: ${createdStores.length}`);
    logger.info(`  - Products: ${createdProducts.length}`);
    logger.info(`  - Inventory entries: ${inventoryEntries.length}`);

    await DatabaseService.close();
    process.exit(0);
  } catch (error) {
    logger.error(error, 'Failed to seed database');
    process.exit(1);
  }
}

seed();
