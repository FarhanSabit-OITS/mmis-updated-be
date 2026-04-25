const {ZodError} = require('zod')

const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    req.validated = result;

    next();
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    }
    next(err);
  }
};
module.exports = {
    validate
}