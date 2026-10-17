import { Router } from 'express';
import { db } from '../../db/index.ts';
import { categories, menuItems } from '../../db/schema.ts';
import { requireAuth, requireRole } from '../auth.ts';
import { asc, desc, eq, and, sql } from 'drizzle-orm';

const router = Router();

// GET /api/menu/categories
router.get('/categories', async (_req, res) => {
  try {
    const allCategories = await db
      .select()
      .from(categories)
      .orderBy(asc(categories.displayOrder));
    res.json(allCategories);
  } catch (error: any) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// GET /api/menu
router.get('/', async (req, res) => {
  try {
    const { search, category, isVeg, isAvailable, sortBy } = req.query;

    const items = await db.select().from(menuItems);

    let filtered = items;

    // Filter by search query
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          (item.categoryName && item.categoryName.toLowerCase().includes(q))
      );
    }

    // Filter by category slug or name
    if (category && typeof category === 'string' && category !== 'all') {
      const catQuery = category.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        if (!item.categoryName) return false;
        const normalized = item.categoryName.toLowerCase().replace(/\s+/g, '-');
        return (
          normalized === catQuery ||
          item.categoryName.toLowerCase() === catQuery
        );
      });
    }

    // Filter by veg / non-veg
    if (isVeg !== undefined && isVeg !== '') {
      const vegBool = String(isVeg) === 'true';
      filtered = filtered.filter((item) => item.isVeg === vegBool);
    }

    // Filter by availability (unless staff asks for all)
    if (isAvailable !== undefined && isAvailable !== '') {
      const availBool = String(isAvailable) === 'true';
      filtered = filtered.filter((item) => item.isAvailable === availBool);
    }

    // Sort items
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // default: highest rated first
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    res.json(filtered);
  } catch (error: any) {
    console.error('Fetch menu error:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// GET /api/menu/:id
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid menu item ID' });
    }

    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    if (!item) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(item);
  } catch (error: any) {
    console.error('Fetch menu item error:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

// POST /api/menu (Staff / Admin)
router.post('/', requireAuth, requireRole(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const { name, description, price, categoryId, isVeg, isAvailable, image } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({ error: 'Name, description, and price are required' });
    }

    let categoryName = null;
    if (categoryId) {
      const [cat] = await db.select().from(categories).where(eq(categories.id, Number(categoryId)));
      if (cat) categoryName = cat.name;
    }

    const [newItem] = await db
      .insert(menuItems)
      .values({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        categoryId: categoryId ? Number(categoryId) : null,
        categoryName,
        isVeg: isVeg === undefined ? true : Boolean(isVeg),
        isAvailable: isAvailable === undefined ? true : Boolean(isAvailable),
        rating: 4.8,
        ratingCount: 1,
        image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      })
      .returning();

    res.status(201).json(newItem);
  } catch (error: any) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

// PUT /api/menu/:id (Staff / Admin)
router.put('/:id', requireAuth, requireRole(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid menu item ID' });
    }

    const { name, description, price, categoryId, isVeg, isAvailable, image } = req.body;

    let categoryName = undefined;
    if (categoryId) {
      const [cat] = await db.select().from(categories).where(eq(categories.id, Number(categoryId)));
      if (cat) categoryName = cat.name;
    }

    const [updated] = await db
      .update(menuItems)
      .set({
        ...(name ? { name: name.trim() } : {}),
        ...(description ? { description: description.trim() } : {}),
        ...(price !== undefined ? { price: parseFloat(price) } : {}),
        ...(categoryId !== undefined ? { categoryId: Number(categoryId) } : {}),
        ...(categoryName ? { categoryName } : {}),
        ...(isVeg !== undefined ? { isVeg: Boolean(isVeg) } : {}),
        ...(isAvailable !== undefined ? { isAvailable: Boolean(isAvailable) } : {}),
        ...(image ? { image } : {}),
      })
      .where(eq(menuItems.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

// DELETE /api/menu/:id (Staff / Admin)
router.delete('/:id', requireAuth, requireRole(['STAFF', 'ADMIN']), async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid menu item ID' });
    }

    const [deleted] = await db.delete(menuItems).where(eq(menuItems.id, id)).returning();
    if (!deleted) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error: any) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

export default router;
