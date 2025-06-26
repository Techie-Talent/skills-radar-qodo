import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: { role: true },
          });

          if (!existingUser) {
            // Get default role for new users
            const defaultRole = await prisma.role.findFirst({
              where: { isDefault: true },
            });

            // Create user with default role
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                googleId: account.providerAccountId,
                roleId: defaultRole?.id,
                lastLoginAt: new Date(),
              },
            });
          } else {
            // Update last login
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { lastLoginAt: new Date() },
            });
          }

          return true;
        } catch (error) {
          console.error("Error during sign in:", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        if (user) {
          session.user.id = user.id;
          session.user.role = user.role;
          session.user.permissions =
            user.role?.permissions.map((rp) => rp.permission) || [];
        }
      }
      return session;
    },
    async jwt({ token }) {
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
