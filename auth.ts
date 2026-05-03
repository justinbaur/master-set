import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    signIn({ user }) {
      const allowed = (process.env.AUTHORIZED_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      return allowed.includes(user.email ?? "");
    },
    authorized({ auth: session }) {
      return !!session?.user;
    },
  },
});
