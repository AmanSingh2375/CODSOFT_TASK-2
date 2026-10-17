import bcrypt from 'bcryptjs';
import { db } from './index.ts';
import {
  categories,
  coupons,
  menuItems,
  orders,
  orderItems,
  reservations,
  restaurantTables,
  users,
} from './schema.ts';

export async function seedDatabase() {
  console.log('Seeding DineDesk database...');

  // 1. Seed Users
  const customerPassword = await bcrypt.hash('customer123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const initialUsers = [
    {
      name: 'Rohan Sharma',
      email: 'customer@dinedesk.com',
      phone: '+91 98765 43210',
      password: customerPassword,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Chef Amit Verma',
      email: 'staff@dinedesk.com',
      phone: '+91 98765 43211',
      password: staffPassword,
      role: 'STAFF',
      avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80',
    },
    {
      name: 'Priya Patel (Manager)',
      email: 'admin@dinedesk.com',
      phone: '+91 98765 43212',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
    },
  ];

  for (const u of initialUsers) {
    await db
      .insert(users)
      .values(u)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: u.name,
          phone: u.phone,
          password: u.password,
          role: u.role,
        },
      });
  }

  // 2. Seed Categories
  const initialCategories = [
    {
      name: 'Starters',
      slug: 'starters',
      description: 'Crispy, savory appetizers and delicious finger foods to begin your feast.',
      image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80',
      displayOrder: 1,
    },
    {
      name: 'Main Course',
      slug: 'main-course',
      description: 'Hearty curries, rich gravies, sizzling platters, and authentic chef specials.',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
      displayOrder: 2,
    },
    {
      name: 'Pizza',
      slug: 'pizza',
      description: 'Hand-tossed wood-fired pizzas with artisanal cheeses and fresh herbs.',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
      displayOrder: 3,
    },
    {
      name: 'Burgers',
      slug: 'burgers',
      description: 'Gourmet brioche burgers loaded with fresh patties, crisp lettuce and house sauces.',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
      displayOrder: 4,
    },
    {
      name: 'Beverages',
      slug: 'beverages',
      description: 'Chilled mocktails, fresh berry smoothies, craft sodas, and aromatic brews.',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
      displayOrder: 5,
    },
    {
      name: 'Desserts',
      slug: 'desserts',
      description: 'Decadent handcrafted desserts, warm chocolate tarts, and creamy sundaes.',
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80',
      displayOrder: 6,
    },
  ];

  for (const c of initialCategories) {
    await db
      .insert(categories)
      .values(c)
      .onConflictDoUpdate({
        target: categories.slug,
        set: {
          name: c.name,
          description: c.description,
          image: c.image,
          displayOrder: c.displayOrder,
        },
      });
  }

  // Fetch seeded categories to map IDs
  const dbCats = await db.select().from(categories);
  const catMap = new Map(dbCats.map((c) => [c.slug, c.id]));

  // 3. Seed Menu Items
  const initialItems = [
    // Starters
    {
      name: 'Crispy Paneer Tikka Bites',
      description: 'Charcoal-grilled cottage cheese cubes marinated in spiced tandoori yogurt, served with mint chutney.',
      price: 260,
      categoryId: catMap.get('starters')!,
      categoryName: 'Starters',
      isVeg: true,
      isAvailable: true,
      rating: 4.8,
      ratingCount: 42,
      image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Honey Chilli Crispy Lotus Stem',
      description: 'Wok-tossed crunchy lotus stem slices coated with sweet honey, spicy chilli glaze, and toasted sesame.',
      price: 240,
      categoryId: catMap.get('starters')!,
      categoryName: 'Starters',
      isVeg: true,
      isAvailable: true,
      rating: 4.7,
      ratingCount: 31,
      image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Spicy Firecracker Chicken Wings',
      description: 'Crispy glazed fried wings tossed in smoked habanero garlic sauce with tangy ranch dip.',
      price: 320,
      categoryId: catMap.get('starters')!,
      categoryName: 'Starters',
      isVeg: false,
      isAvailable: true,
      rating: 4.9,
      ratingCount: 65,
      image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Herb Crusted Stuffed Mushrooms',
      description: 'Plump button mushrooms filled with spinach, roasted garlic, and mozzarella, baked golden.',
      price: 250,
      categoryId: catMap.get('starters')!,
      categoryName: 'Starters',
      isVeg: true,
      isAvailable: true,
      rating: 4.6,
      ratingCount: 22,
      image: 'https://images.unsplash.com/photo-1506280754576-f6fa8a873550?auto=format&fit=crop&w=600&q=80',
    },

    // Main Course
    {
      name: 'Royal Dal Makhani Platter',
      description: 'Slow-simmered black lentils over 24 hours with churned butter and cream, served with 2 butter naans.',
      price: 340,
      categoryId: catMap.get('main-course')!,
      categoryName: 'Main Course',
      isVeg: true,
      isAvailable: true,
      rating: 4.9,
      ratingCount: 110,
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Butter Chicken Grand Cru',
      description: 'Tender tandoori chicken cooked in velvety smoked tomato cashew gravy, finished with fenugreek leaves.',
      price: 390,
      categoryId: catMap.get('main-course')!,
      categoryName: 'Main Course',
      isVeg: false,
      isAvailable: true,
      rating: 4.9,
      ratingCount: 145,
      image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Hyderabadi Dum Biryani (Paneer)',
      description: 'Fragrant basmati rice layered with marinated paneer, saffron, caramelized onions, and house raita.',
      price: 310,
      categoryId: catMap.get('main-course')!,
      categoryName: 'Main Course',
      isVeg: true,
      isAvailable: true,
      rating: 4.8,
      ratingCount: 88,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Awadhi Mutton Rogan Josh',
      description: 'Slow-cooked Kashmiri style tender lamb curry infused with mace, cardamom, and authentic red kashmiri chilies.',
      price: 460,
      categoryId: catMap.get('main-course')!,
      categoryName: 'Main Course',
      isVeg: false,
      isAvailable: true,
      rating: 4.7,
      ratingCount: 52,
      image: 'https://images.unsplash.com/photo-1545247181-516773cae754?auto=format&fit=crop&w=600&q=80',
    },

    // Pizza
    {
      name: 'Classic Margherita Rustica',
      description: 'San Marzano tomato sauce, fresh buffalo mozzarella, fragrant Genovese basil, and extra virgin olive oil.',
      price: 380,
      categoryId: catMap.get('pizza')!,
      categoryName: 'Pizza',
      isVeg: true,
      isAvailable: true,
      rating: 4.8,
      ratingCount: 79,
      image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Smoked BBQ Chicken Pizza',
      description: 'Smoky pulled chicken, red onions, bell peppers, mozzarella, and hickory barbecue sauce on thin sourdough crust.',
      price: 450,
      categoryId: catMap.get('pizza')!,
      categoryName: 'Pizza',
      isVeg: false,
      isAvailable: true,
      rating: 4.9,
      ratingCount: 92,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Truffle Wild Mushroom Pizza',
      description: 'Shiitake and cremini mushrooms, fontina cheese, caramelized shallots, and white truffle oil drizzle.',
      price: 480,
      categoryId: catMap.get('pizza')!,
      categoryName: 'Pizza',
      isVeg: true,
      isAvailable: true,
      rating: 4.7,
      ratingCount: 39,
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80',
    },

    // Burgers
    {
      name: 'The Ultimate Truffle Cheeseburger',
      description: 'Juicy smashed beef patty, aged cheddar, caramelized balsamic onions, arugula, and truffle mayo on toasted brioche.',
      price: 360,
      categoryId: catMap.get('burgers')!,
      categoryName: 'Burgers',
      isVeg: false,
      isAvailable: true,
      rating: 4.9,
      ratingCount: 104,
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Crispy Peri-Peri Paneer Burger',
      description: 'Spiced panko crumb paneer patty, crunchy coleslaw, pickled gherkins, and peri-peri aioli in golden sesame bun.',
      price: 290,
      categoryId: catMap.get('burgers')!,
      categoryName: 'Burgers',
      isVeg: true,
      isAvailable: true,
      rating: 4.7,
      ratingCount: 68,
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Avocado Veggie Crunch Burger',
      description: 'House-made quinoa and edamame patty topped with fresh sliced avocado, chipotle relish, and romaine lettuce.',
      price: 310,
      categoryId: catMap.get('burgers')!,
      categoryName: 'Burgers',
      isVeg: true,
      isAvailable: true,
      rating: 4.6,
      ratingCount: 45,
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=600&q=80',
    },

    // Beverages
    {
      name: 'Mint Mojito Refresher',
      description: 'Crushed garden mint, freshly squeezed key lime, cane sugar syrup, and fizzy soda over cracked ice.',
      price: 150,
      categoryId: catMap.get('beverages')!,
      categoryName: 'Beverages',
      isVeg: true,
      isAvailable: true,
      rating: 4.8,
      ratingCount: 56,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Berry Blast Antioxidant Smoothie',
      description: 'Blended organic blueberries, raspberries, strawberries, greek yogurt, and a touch of wild honey.',
      price: 190,
      categoryId: catMap.get('beverages')!,
      categoryName: 'Beverages',
      isVeg: true,
      isAvailable: true,
      rating: 4.7,
      ratingCount: 41,
      image: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Artisanal Cold Brew Coffee',
      description: 'Steeped for 18 hours using single-origin Arabica beans, served chilled over hand-carved ice sphere.',
      price: 180,
      categoryId: catMap.get('beverages')!,
      categoryName: 'Beverages',
      isVeg: true,
      isAvailable: true,
      rating: 4.8,
      ratingCount: 62,
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
    },

    // Desserts
    {
      name: 'Molten Belgian Chocolate Lava Cake',
      description: 'Warm chocolate cake with a gooey dark chocolate center, accompanied by Madagascan vanilla bean gelato.',
      price: 240,
      categoryId: catMap.get('desserts')!,
      categoryName: 'Desserts',
      isVeg: true,
      isAvailable: true,
      rating: 4.9,
      ratingCount: 130,
      image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Classic New York Blueberry Cheesecake',
      description: 'Velvety baked cream cheese on a buttery graham cracker crust, crowned with warm blueberry compote.',
      price: 260,
      categoryId: catMap.get('desserts')!,
      categoryName: 'Desserts',
      isVeg: true,
      isAvailable: true,
      rating: 4.9,
      ratingCount: 94,
      image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Saffron Pistachio Gulab Jamun Sundae',
      description: 'Warm melt-in-mouth saffron infused dumplings served over chilled rabri and crushed roasted pistachios.',
      price: 210,
      categoryId: catMap.get('desserts')!,
      categoryName: 'Desserts',
      isVeg: true,
      isAvailable: true,
      rating: 4.8,
      ratingCount: 77,
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // Insert menu items if table is empty
  const existingItems = await db.select().from(menuItems);
  if (existingItems.length === 0) {
    for (const item of initialItems) {
      await db.insert(menuItems).values(item);
    }
  }

  // 4. Seed Restaurant Tables
  const initialTables = [
    { tableNumber: 'T-01', capacity: 2, location: 'Window Booth', status: 'AVAILABLE' },
    { tableNumber: 'T-02', capacity: 2, location: 'Window Booth', status: 'AVAILABLE' },
    { tableNumber: 'T-03', capacity: 4, location: 'Main Dining Hall', status: 'AVAILABLE' },
    { tableNumber: 'T-04', capacity: 4, location: 'Main Dining Hall', status: 'AVAILABLE' },
    { tableNumber: 'T-05', capacity: 6, location: 'Outdoor Garden Terrace', status: 'AVAILABLE' },
    { tableNumber: 'T-06', capacity: 6, location: 'Outdoor Garden Terrace', status: 'AVAILABLE' },
    { tableNumber: 'T-07', capacity: 8, location: 'Private Family Lounge', status: 'AVAILABLE' },
    { tableNumber: 'T-08', capacity: 10, location: 'VIP Executive Room', status: 'AVAILABLE' },
  ];

  for (const t of initialTables) {
    await db
      .insert(restaurantTables)
      .values(t)
      .onConflictDoUpdate({
        target: restaurantTables.tableNumber,
        set: {
          capacity: t.capacity,
          location: t.location,
          status: t.status,
        },
      });
  }

  // 5. Seed Coupons
  const initialCoupons = [
    {
      code: 'WELCOME10',
      description: '10% discount on all orders above ₹300',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrderAmount: 300,
      maxDiscountAmount: 150,
      isActive: true,
    },
    {
      code: 'SAVE50',
      description: 'Flat ₹50 off on orders above ₹400',
      discountType: 'FIXED',
      discountValue: 50,
      minOrderAmount: 400,
      maxDiscountAmount: 50,
      isActive: true,
    },
    {
      code: 'FEAST20',
      description: '20% discount on family orders above ₹1,000',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrderAmount: 1000,
      maxDiscountAmount: 300,
      isActive: true,
    },
  ];

  for (const cp of initialCoupons) {
    await db
      .insert(coupons)
      .values(cp)
      .onConflictDoUpdate({
        target: coupons.code,
        set: {
          description: cp.description,
          discountType: cp.discountType,
          discountValue: cp.discountValue,
          minOrderAmount: cp.minOrderAmount,
          maxDiscountAmount: cp.maxDiscountAmount,
          isActive: cp.isActive,
        },
      });
  }

  // 6. Seed Sample Reservations & Orders if empty
  const existingOrders = await db.select().from(orders);
  if (existingOrders.length === 0) {
    const cust = (await db.select().from(users).limit(1))[0];
    const firstTable = (await db.select().from(restaurantTables).limit(1))[0];

    // Seed sample reservation
    await db.insert(reservations).values({
      userId: cust?.id,
      customerName: 'Rohan Sharma',
      customerEmail: 'customer@dinedesk.com',
      customerPhone: '+91 98765 43210',
      tableId: firstTable?.id,
      tableNumber: firstTable?.tableNumber || 'T-01',
      reservationDate: '2026-10-02',
      timeSlot: '19:30 - 21:00',
      guestCount: 2,
      status: 'CONFIRMED',
      specialNotes: 'Window view requested for anniversary dinner.',
    });

    // Seed sample active order for live tracking demo
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber: 'DD-2026-001',
        userId: cust?.id,
        customerName: 'Rohan Sharma',
        customerEmail: 'customer@dinedesk.com',
        customerPhone: '+91 98765 43210',
        orderType: 'DINE_IN',
        tableNumber: 'T-01',
        subtotal: 640,
        discountAmount: 64,
        taxAmount: 28.8,
        totalAmount: 604.8,
        couponCode: 'WELCOME10',
        status: 'PREPARING',
        paymentStatus: 'PAID',
        paymentMethod: 'ONLINE',
        notes: 'Extra spicy tandoori bites please',
      })
      .returning();

    if (newOrder) {
      const items = await db.select().from(menuItems).limit(2);
      if (items.length > 0) {
        await db.insert(orderItems).values([
          {
            orderId: newOrder.id,
            menuItemId: items[0].id,
            name: items[0].name,
            price: items[0].price,
            quantity: 1,
            total: items[0].price,
            image: items[0].image,
          },
          {
            orderId: newOrder.id,
            menuItemId: items[1].id,
            name: items[1].name,
            price: items[1].price,
            quantity: 1,
            total: items[1].price,
            image: items[1].image,
          },
        ]);
      }
    }
  }

  console.log('Seeding completed successfully!');
}

// Run directly if invoked
if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
