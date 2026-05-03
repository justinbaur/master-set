import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6 py-24">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Admin Sign In</h1>
        <p className="text-sm text-muted-foreground">
          Only authorized accounts may access this area.
        </p>
      </div>
      <form
        action={async () => {
          "use server";
          await signIn("google", { redirectTo: "/" });
        }}
      >
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
