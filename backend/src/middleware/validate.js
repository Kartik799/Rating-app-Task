export function validate(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (e) {
      return res.status(400).json({ message: 'Validation error', issues: e.errors });
    }
  };
}
