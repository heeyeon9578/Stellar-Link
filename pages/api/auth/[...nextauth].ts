import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/util/database";
import { compare } from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    // GitHub 로그인
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    // Google 로그인
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    // Discord 로그인
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
    // Credentials 로그인
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Missing credentials");
        }

        const db = (await connectDB).db("StellarLink");
        const user = await db.collection("user_cred").findOne({ email: credentials.email });

        if (!user) {
          console.log("해당 이메일은 없음");
          return null;
        }

        const isValidPassword = await compare(credentials.password, user.password);
        console.log(`isValidPassword: `, isValidPassword);

        if (!isValidPassword) {
          console.log("비밀번호 틀림");
          return null;
        }

        // 로그인 성공
        console.log("로그인 성공", user);
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          profileImage: user.profileImage || "/default-profile.png", // 기본 프로필 이미지 설정
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  callbacks: {
    jwt: async ({ token, user, account }) => {
      if (user && account) {
        token.user = {
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          provider: account.provider, // provider 정보 추가
        };
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.user) {
        session.user = token.user as {
          name: string;
          email: string;
          profileImage: string;
          provider: string; // provider 정보 추가
        };
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, //CSRF 공격 방지
  adapter: MongoDBAdapter(connectDB),
};

export default NextAuth(authOptions);
