import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import NextAuth, { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "@/util/database";
import { compare } from "bcryptjs";

interface UserToken {
  name: string;
  email: string;
  profileImage: string;
  provider: string;
}

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
        const db = (await connectDB).db("StellarLink");
        const existingUser = await db.collection("user_cred").findOne({ email: user.email });

        if (!existingUser) {
          // 새로운 사용자라면 DB에 저장
          const newUser = {
            name: user.name || account.provider, // 이름이 없으면 provider 이름 사용
            email: user.email,
            profileImage: user.image || "/default-profile.png",
            provider: account.provider,
            createdAt: new Date(),
          };
          await db.collection("user_cred").insertOne(newUser);
          console.log("소셜 로그인 사용자 저장 완료:", newUser);
        }
        
        token.user = {
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          provider: account.provider,
        } as UserToken; // 타입 캐스팅
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.user) {
        const db = (await connectDB).db("StellarLink");
        const user = await db.collection("user_cred").findOne({ email: (token.user as UserToken).email });
  
        if (user) {
          session.user = {
            name: user.name,
            email: user.email,
            profileImage: user.profileImage || "/default-profile.png", // 기본 프로필 이미지 설정
            provider: (token.user as UserToken).provider, // 기존 provider 유지
          };
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // CSRF 공격 방지
  adapter: MongoDBAdapter(connectDB),
};

export default NextAuth(authOptions);
