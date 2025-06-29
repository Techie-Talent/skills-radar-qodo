import { NextAuthOptions, Profile } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

// Helper function to check if hosted domain is allowed
function isHostedDomainAllowed(
  hostedDomain: string | undefined,
  email: string
): boolean {
  const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN;

  // If no domain restriction is set, allow all emails
  if (!allowedDomain) {
    return true;
  }

  const allowedDomainLower = allowedDomain.toLowerCase();

  // First, check the "hd" (hosted domain) property from Google OAuth
  // This is the most reliable method for Google Workspace accounts
  if (hostedDomain) {
    return hostedDomain.toLowerCase() === allowedDomainLower;
  }

  // Fallback: If no hosted domain (personal Gmail accounts),
  // check email domain for backwards compatibility
  const emailDomain = email.split("@")[1]?.toLowerCase();
  return emailDomain === allowedDomainLower;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request the hosted domain parameter
          hd: process.env.ALLOWED_EMAIL_DOMAIN || undefined,
          // Ensure we get the hosted domain in the response
          scope: "openid email profile",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        // Extract hosted domain from Google profile
        const hostedDomain = (profile as Profile & { hd?: string })?.hd;

        // Check domain restriction using hosted domain
        if (!user.email || !isHostedDomainAllowed(hostedDomain, user.email)) {
          console.log(
            `Sign-in denied for email: ${user.email}, hosted domain: ${hostedDomain} - Domain not allowed`
          );
          return false;
        }

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

            // Create user with default role, including hosted domain info
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
    async jwt({ token, account, profile }) {
      // Store hosted domain in JWT for future reference
      if (account?.provider === "google" && profile) {
        token.hostedDomain = (profile as Profile & { hd?: string })?.hd;
      }
      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    error: "/auth/error", // Custom error page for domain restrictions
  },
};
