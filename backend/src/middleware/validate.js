export function validate(schema) {
  return async function validationMiddleware(req, res, next) {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        params: req.params,
        query: req.query
      });

      req.body = validatedData.body;
      req.params = validatedData.params;
      req.query = validatedData.query;

      next();
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message
          }))
        });
      }

      next(error);
    }
  };
}