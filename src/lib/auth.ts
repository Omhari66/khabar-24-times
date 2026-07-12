import { NextAuthOptions } from "next-auth";
import { Role } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
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
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
        token.image = user.image;
      }

      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, image: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          if (dbUser.image) token.image = dbUser.image;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        if (token.image) session.user.image = token.image as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        let finalUserId = user.id;
        let finalUserRole = "USER";

        if (!existingUser) {
          const newUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name,
              image: user.image,
              role: "USER",
            },
          });
          finalUserId = newUser.id;
        } else {
          finalUserId = existingUser.id;
          finalUserRole = existingUser.role;
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
            },
          });
        }

        const auditRepository = new AuditRepository();
        const auditService = new AuditService(auditRepository);
        await auditService.log({
          action: "USER_LOGIN_OAUTH",
          entityType: "User",
          entityId: finalUserId,
          status: "SUCCESS",
          userId: finalUserId,
          userRole: finalUserRole,
          newValue: { email: user.email, name: user.name, provider: "google" },
        });
      } else if (account?.provider === "credentials") {
        const auditRepository = new AuditRepository();
        const auditService = new AuditService(auditRepository);
        await auditService.log({
          action: "USER_LOGIN",
          entityType: "User",
          entityId: user.id,
          status: "SUCCESS",
          userId: user.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          userRole: (user as any).role,
          newValue: { email: user.email, name: user.name },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
  },
};
