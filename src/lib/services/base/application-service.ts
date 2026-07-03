import { createLogger } from "@/lib/logger";

export abstract class ApplicationService {
  protected readonly logger;

  constructor(scope: string) {
    this.logger = createLogger(scope);
  }
}
