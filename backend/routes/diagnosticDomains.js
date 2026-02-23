import express from 'express';

const router = express.Router();

// Public: GET /api/diagnostic-domains
// Display-only list for statistics (questions stay generic).
router.get('/', async (_req, res) => {
  const domains = [
    'IT',
    'Marketing',
    'Management',
    'Finance',
    'RH',
    'Design',
    'Sales',
    'Operations',
    'Other',
  ];

  res.json({ success: true, data: domains });
});

export default router;
