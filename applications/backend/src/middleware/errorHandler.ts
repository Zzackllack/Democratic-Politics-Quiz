import { Request, Response, NextFunction } from "express";

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Prisma errors
  if (err.message?.includes("Unique constraint failed")) {
    statusCode = 409;
    message = "Resource already exists";
  }

  if (err.message?.includes("Record to update not found")) {
    statusCode = 404;
    message = "Resource not found";
  }

  // Validation errors
  if (err.message?.includes("Invalid input")) {
    statusCode = 400;
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
