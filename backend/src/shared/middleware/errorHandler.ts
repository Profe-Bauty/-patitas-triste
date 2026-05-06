import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  error.statusCode = error.statusCode || 500;

  const response = {
    success: false,
    error: {
      message: error.message,
      statusCode: error.statusCode,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  };

  res.status(error.statusCode).json(response);
};

export class CustomError extends Error implements AppError {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
