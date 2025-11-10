export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message || "An error occurred",
    });
  }

  if (err.code === "PGRST116") {
    return res.status(404).json({
      error: "Resource not found",
    });
  }

  res.status(500).json({
    error: "Internal server error",
  });
};

