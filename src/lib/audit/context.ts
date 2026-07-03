import { AsyncLocalStorage } from "node:async_hooks";

export interface AuditContextStore {
  requestPath?: string;
  requestMethod?: string;
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
  userRole?: string;
}

export const auditLocalStorage = new AsyncLocalStorage<AuditContextStore>();

export function getAuditContext(): AuditContextStore | undefined {
  return auditLocalStorage.getStore();
}

export function runWithAuditContext<T>(request: Request, fn: () => Promise<T> | T): Promise<T> | T {
  let requestPath: string | undefined;
  let requestMethod: string | undefined;
  let ipAddress: string | undefined;
  let userAgent: string | undefined;

  try {
    const url = new URL(request.url);
    requestPath = url.pathname;
    requestMethod = request.method;
    ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      undefined;
    userAgent = request.headers.get("user-agent") || undefined;
  } catch {
    // Fail-safe if request object is mock or headers are not accessible
  }

  const store: AuditContextStore = {
    requestPath,
    requestMethod,
    ipAddress,
    userAgent,
  };

  return auditLocalStorage.run(store, fn);
}

export function updateAuditContext(data: Partial<AuditContextStore>) {
  const store = auditLocalStorage.getStore();
  if (store) {
    Object.assign(store, data);
  }
}
