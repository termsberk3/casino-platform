import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorResponseBody {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  method: string;
  timestamp: string;
}

interface NestHttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const parsedException = this.parseExceptionResponse(exceptionResponse);

    const body: ErrorResponseBody = {
      statusCode,
      message: parsedException.message,
      error: parsedException.error || this.getDefaultErrorName(statusCode),
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }

  private parseExceptionResponse(exceptionResponse: string | object | null): {
    message: string | string[];
    error?: string;
  } {
    if (typeof exceptionResponse === 'string') {
      return {
        message: exceptionResponse,
      };
    }

    if (exceptionResponse && typeof exceptionResponse === 'object') {
      const response = exceptionResponse as NestHttpExceptionResponse;

      return {
        message: response.message || 'Unexpected error occurred',
        error: response.error,
      };
    }

    return {
      message: 'Internal server error',
    };
  }

  private getDefaultErrorName(statusCode: number): string {
    if (statusCode >= 500) {
      return 'Internal Server Error';
    }

    if (statusCode === 401) {
      return 'Unauthorized';
    }

    if (statusCode === 403) {
      return 'Forbidden';
    }

    if (statusCode === 404) {
      return 'Not Found';
    }

    if (statusCode === 409) {
      return 'Conflict';
    }

    if (statusCode === 429) {
      return 'Too Many Requests';
    }

    return 'Bad Request';
  }
}
