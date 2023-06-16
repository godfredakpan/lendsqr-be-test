import { Response } from "express";

export const createSuccessResponse = (res: Response, message: string) => {
  return res.json({ message });
};

export const createErrorResponse = (res: Response, error: string, statusCode: number) => {
  return res.status(statusCode).json({ error });
};
