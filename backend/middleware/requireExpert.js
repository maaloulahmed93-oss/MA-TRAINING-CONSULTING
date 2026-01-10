export default function requireExpert(req, res, next) {
  const configuredKey = process.env.ADMIN_API_KEY;

  // If no key is configured, do not block (dev-friendly).
  if (!configuredKey) return next();

  const headerKey = req.header('x-admin-key');
  if (headerKey && headerKey === configuredKey) return next();

  return res.status(401).json({
    success: false,
    message: 'Unauthorized',
  });
}
