import express from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authRequired } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', authRequired, async (req, res) => {
  const { q, address, sortBy = 'name', order = 'asc' } = req.query;
  const where = {
    AND: [
      q ? { name: { contains: String(q), mode: 'insensitive' } } : {},
      address ? { address: { contains: String(address), mode: 'insensitive' } } : {}
    ]
  };
  const stores = await prisma.store.findMany({
    where,
    orderBy: { [sortBy]: order.toLowerCase() === 'desc' ? 'desc' : 'asc' },
    include: {
      ratings: { select: { value: true } }
    }
  });
  const currentUserId = req.user?.id;
  const ratings = await prisma.rating.findMany({ where: { userId: currentUserId } });
  const map = new Map(ratings.map(r => [r.storeId, r.value]));

  const data = stores.map(s => ({
    id: s.id,
    name: s.name,
    address: s.address,
    overallRating: s.ratings.length ? (s.ratings.reduce((a, r) => a + r.value, 0) / s.ratings.length) : null,
    myRating: map.get(s.id) ?? null
  }));
  res.json(data);
});

const ratingSchema = z.object({ value: z.number().int().min(1).max(5) });

router.post('/:id/ratings', authRequired, async (req, res) => {
  const parsed = ratingSchema.safeParse({ value: Number(req.body.value) });
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.errors });
  const storeId = Number(req.params.id);
  const userId = req.user.id;

  const existing = await prisma.rating.findUnique({
    where: { userId_storeId: { userId, storeId } }
  });

  const rating = existing
    ? await prisma.rating.update({ where: { id: existing.id }, data: { value: parsed.data.value } })
    : await prisma.rating.create({ data: { value: parsed.data.value, userId, storeId } });

  res.json(rating);
});

export default router;
