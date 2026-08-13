export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.code === 11000) {
    return res.status(409).json({
      message: "A record with this unique value already exists",
    });
  }

  return res.status(err.statusCode || 500).json({
    message: err.message || "Server Error",
  });
};
