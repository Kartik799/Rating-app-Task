import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, requireRole } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

router.use(authRequired, requireRole('OWNER'));

router.get('/ratings', async (req, res) => {
  const stores = await prisma.store.findMany({
    where: { ownerId: req.user.id },
    include: {
      ratings: {
        include: { user: { select: { id: true, name: true, email: true } } }
      }
    }
  });

  const result = stores.map(s => ({
    storeId: s.id,
    storeName: s.name,
    averageRating: s.ratings.length ? (s.ratings.reduce((a, r) => a + r.value, 0) / s.ratings.length) : null,
    ratings: s.ratings.map(r => ({
      id: r.id, value: r.value, user: r.user
    }))
  }));

  res.json(result);
});

export default router;
