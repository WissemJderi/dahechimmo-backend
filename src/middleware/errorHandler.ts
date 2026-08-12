import { NextFunction, Request, Response } from "express";
import multer from "multer";

type HttpError = { status?: unknown; message?: unknown };

const isHttpError = (err: unknown): err is HttpError =>
  typeof err === "object" && err !== null;

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    res.status(status).json({ error: err.message });
    return;
  }

  console.error(err instanceof Error ? err.stack : err);
  const status =
    isHttpError(err) && typeof err.status === "number" ? err.status : 500;
  const message =
    isHttpError(err) && typeof err.message === "string"
      ? err.message
      : "Internal Server Error";
  res.status(status).json({ message });
};