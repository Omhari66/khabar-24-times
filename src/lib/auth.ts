import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { parseInput, requiredTrimmedString } from "@/lib/api/validation";
import { createLogger } from "@/lib/logger";
import { AuditRepository } from "@/lib/repositories/audit-repository";
import { AuditService } from "@/lib/services/audit-service";

const logger = createLogger("auth");

const credentialSchema = z.object({
  email: requiredTrimmedString("Invalid credentials").transform((value) => value.toLowerCase()),
  password: requiredTrimmedString("Invalid credentials"),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "reporter@news.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        let parsedCredentials: z.infer<typeof credentialSchema>;

        try {
          parsedCredentials = parseInput(credentials, credentialSchema);
        } catch (error) {
          logger.warn("Credential validation failed", { error });
          throw new Error("Invalid credentials");
        }

        const user = await prisma.user.findUnique({
          where: {
            email: parsedCredentials.email,
          },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordCorrect = await bcrypt.compare(
          parsedCredentials.password,
          user.password
        );

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      const auditRepository = new AuditRepository();
      const auditService = new AuditService(auditRepository);
      await auditService.log({
        action: "USER_LOGIN",
        entityType: "User",
        entityId: user.id,
        status: "SUCCESS",
        userId: user.id,
        userRole: user.role,
        newValue: { email: user.email, name: user.name },
      });
    },
  },
  pages: {
    signIn: "/login",
  },
};
