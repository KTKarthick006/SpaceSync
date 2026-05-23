import express from 'express';
import Hall from '../models/Hall.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (_req, res) => {
  try { res.json(await Hall.find({ isActive: true }).sort({ name: 1 })); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try { res.status(201).json(await Hall.create(req.body)); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hall) return res.status(404).json({ message: 'Hall not found' });
    res.json(hall);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try { await Hall.findByIdAndUpdate(req.params.id, { isActive: false }); res.json({ message: 'Hall deactivated' }); }
  catch (err) { res.status(400).json({ message: err.message }); }
});

export default router;
