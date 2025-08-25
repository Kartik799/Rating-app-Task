import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authRequired, requireRole } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authRequired, requireRole('ADMIN'));

const newUserSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().max(400),
  password: z.string().min(8).max(16).regex(/[A-Z]/).regex(/[^A-Za-z0-9]/),
  role: z.enum(['ADMIN', 'USER', 'OWNER'])
});

router.post('/users', async (req, res) => {
  const parsed = newUserSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors });
  const { name, email, address, password, role } = parsed.data;

  const bcrypt = (await import('bcryptjs')).default;
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({ data: { name, email, address, passwordHash, role } });
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, address: user.address });
  } catch (e) {
    res.status(409).json({ message: 'Email already exists' });
  }
});

const newStoreSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  address: z.string().max(400),
  ownerId: z.number().int().optional()
});

router.post('/stores', async (req, res) => {
  const parsed = newStoreSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors });
  const store = await prisma.store.create({ data: parsed.data });
  res.json(store);
});

router.get('/metrics', async (_req, res) => {
  const [users, stores, ratings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count()
  ]);
  res.json({ users, stores, ratings });
});

function buildFilters(query) {
  const { name, email, address, role } = query;
  const where = {};
  if (name) where['name'] = { contains: String(name), mode: 'insensitive' };
  if (email) where['email'] = { contains: String(email), mode: 'insensitive' };
  if (address) where['address'] = { contains: String(address), mode: 'insensitive' };
  if (role) where['role'] = role;
  return where;
}

router.get('/users', async (req, res) => {
  const where = buildFilters(req.query);
  const sortBy = req.query.sortBy || 'id';
  const order = (req.query.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';
  const users = await prisma.user.findMany({
    where,
    orderBy: { [sortBy]: order },
    select: { id: true, name: true, email: true, address: true, role: true }
  });
  res.json(users);
});

router.get('/stores', async (req, res) => {
  const { name, email, address } = req.query;
  const where = {};
  if (name) where['name'] = { contains: String(name), mode: 'insensitive' };
  if (email) where['email'] = { contains: String(email), mode: 'insensitive' };
  if (address) where['address'] = { contains: String(address), mode: 'insensitive' };

  const sortBy = req.query.sortBy || 'id';
  const order = (req.query.order || 'asc').toLowerCase() === 'desc' ? 'desc' : 'asc';

  const stores = await prisma.store.findMany({
    where,
    orderBy: { [sortBy]: order },
    include: {
      ratings: { select: { value: true } }
    }
  });

  const withAvg = stores.map(s => ({
    id: s.id,
    name: s.name,
    email: s.email,
    address: s.address,
    rating: s.ratings.length ? (s.ratings.reduce((a, r) => a + r.value, 0) / s.ratings.length) : null
  }));

  res.json(withAvg);
});

router.get('/users/:id', async (req, res) => {
  const id = Number(req.params.id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, address: true, role: true, stores: true }
  });
  if (!user) return res.status(404).json({ message: 'Not found' });

  if (user.role === 'OWNER') {
    const ownerStores = await prisma.store.findMany({
      where: { ownerId: user.id },
      include: { ratings: { select: { value: true } } }
    });
    const ratings = ownerStores.flatMap(s => s.ratings.map(r => r.value));
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;
    return res.json({ ...user, ownerAverageRating: avg });
  }

  res.json(user);
});

export default router;
