import { NextFunction, Request, Response } from "express";

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get("User-Agent") || "Unknown";

  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);

  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((method === "POST" || method === "PUT") && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove any sensitive fields if needed
    console.log(`[${timestamp}] Request body:`, JSON.stringify(sanitizedBody, null, 2));
  }

  next();
};
