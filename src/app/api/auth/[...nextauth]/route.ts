import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { runWithAuditContext } from "@/lib/audit/context";

const handler = NextAuth(authOptions);

const wrappedHandler = (req: Request, ctx: { params: Record<string, string | string[]> }) =>
  runWithAuditContext(req, () => handler(req, ctx));

export { wrappedHandler as GET, wrappedHandler as POST };
