const requests = new Map();

export const rateLimit = ({ windowMs, max }) => (req, res, next) => {
  const now = Date.now();
  const key = `${req.ip}:${req.baseUrl}${req.path}`;
  const current = requests.get(key);
  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }
  if (current.count >= max) {
    res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
    return res.status(429).json({ success: false, message: 'Too many requests. Please try again later.' });
  }
  current.count += 1;
  return next();
};

// Bound memory use in this single-process limiter.
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requests) if (value.resetAt <= now) requests.delete(key);
}, 60_000).unref();
