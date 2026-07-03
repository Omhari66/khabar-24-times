import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError, BadRequestError } from "@/lib/errors";
import { apiError } from "@/lib/api/response";
import { createLogger } from "@/lib/logger";
import { runWithAuditContext } from "@/lib/audit/context";

type RouteHandler<TContext = void> = (
  request: Request,
  context: TContext
) => Promise<NextResponse> | NextResponse;

interface RouteHandlerOptions {
  scope: string;
}

export function withApiHandler<TContext = void>(
  options: RouteHandlerOptions,
  handler: RouteHandler<TContext>
) {
  const logger = createLogger(options.scope);

  return async (request: Request, context: TContext) => {
    try {
      return await runWithAuditContext(request, () => handler(request, context));
    } catch (error) {
      if (error instanceof AppError) {
        if (error.statusCode >= 500) {
          logger.error(error.message, { code: error.code, details: error.details });
        } else {
          logger.warn(error.message, { code: error.code, details: error.details });
        }

        return apiError(error.message, { status: error.statusCode });
      }

      if (error instanceof ZodError) {
        const validationError = new BadRequestError(
          error.issues.map((issue) => issue.message).join(", ")
        );
        logger.warn(validationError.message, { code: validationError.code });
        return apiError(validationError.message, { status: validationError.statusCode });
      }

      logger.error("Unhandled route error", { error });
      return apiError("Internal Server Error", { status: 500 });
    }
  };
}
