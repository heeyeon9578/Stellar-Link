import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  // User 타입 확장
  interface User extends DefaultUser {
    profileImage?: string;
    provider?: string;
  }

  // Session 타입 확장
  interface Session {
    user: {
      name?: string;
      email?: string;
      profileImage?: string;
      provider?: string;
    };
  }

  // JWT 타입 확장
  interface JWT {
    user?: {
      name?: string;
      email?: string;
      profileImage?: string;
      provider?: string;
    };
  }
}
