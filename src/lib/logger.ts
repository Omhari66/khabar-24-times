type LogLevel = "info" | "warn" | "error";
type LogMeta = Record<string, unknown> | undefined;

function normalizeMeta(meta?: LogMeta): LogMeta {
  if (!meta) return undefined;

  return Object.fromEntries(
    Object.entries(meta).map(([key, value]) => {
      if (value instanceof Error) {
        return [
          key,
          {
            name: value.name,
            message: value.message,
            stack: value.stack,
          },
        ];
      }

      return [key, value];
    })
  );
}

const isProd = process.env.NODE_ENV === "production";

function writeLog(level: LogLevel, scope: string, message: string, meta?: LogMeta) {
  const payload = normalizeMeta(meta);

  if (isProd) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      scope,
      message,
      ...(payload && { meta: payload }),
    };
    if (level === "error") {
      console.error(JSON.stringify(logEntry));
    } else if (level === "warn") {
      console.warn(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
    return;
  }

  const prefix = `[${scope}] ${message}`;
  if (level === "error") {
    console.error(prefix, payload ?? "");
    return;
  }

  if (level === "warn") {
    console.warn(prefix, payload ?? "");
    return;
  }

  console.log(prefix, payload ?? "");
}

export function createLogger(scope: string) {
  return {
    info(message: string, meta?: LogMeta) {
      writeLog("info", scope, message, meta);
    },
    warn(message: string, meta?: LogMeta) {
      writeLog("warn", scope, message, meta);
    },
    error(message: string, meta?: LogMeta) {
      writeLog("error", scope, message, meta);
    },
  };
}
