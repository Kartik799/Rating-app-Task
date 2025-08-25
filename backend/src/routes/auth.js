import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { signJwt } from '../utils/jwt.js';
import { authRequired } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = express.Router();

const emailSchema = z.string().email();
const passwordSchema = z.string()
  .min(8).max(16)
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

const signupSchema = z.object({
  name: z.string().min(20).max(60),
  email: emailSchema,
  address: z.string().max(400),
  password: passwordSchema
});

router.post('/signup', async (req, res) => {
  const data = signupSchema.safeParse(req.body);
  if (!data.success) return res.status(400).json({ errors: data.error.errors });

  const { name, email, address, password } = data.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email already registered' });

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, address, passwordHash: hash, role: 'USER' }
  });

  const token = signJwt({ id: user.id, role: user.role, email: user.email });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

router.post('/login', async (req, res) => {
  const schema = z.object({ email: emailSchema, password: z.string().min(1) });
  const data = schema.safeParse(req.body);
  if (!data.success) return res.status(400).json({ errors: data.error.errors });

  const { email, password } = data.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signJwt({ id: user.id, role: user.role, email: user.email });
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

router.post('/change-password', authRequired, async (req, res) => {
  const schema = z.object({ oldPassword: z.string().min(1), newPassword: passwordSchema });
  const data = schema.safeParse(req.body);
  if (!data.success) return res.status(400).json({ errors: data.error.errors });

  const { oldPassword, newPassword } = data.data;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const ok = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!ok) return res.status(400).json({ message: 'Old password incorrect' });

  const hash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hash } });
  res.json({ message: 'Password updated' });
});

export default router;
