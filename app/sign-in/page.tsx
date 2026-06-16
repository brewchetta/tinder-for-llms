import { redirect } from "next/navigation";
import { auth, signIn } from "@/lib/auth";

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/swipe");

  async function login(formData: FormData) {
    "use server";
    const email = String(formData.get("email") ?? "");
    await signIn("credentials", { email, redirectTo: "/swipe" });
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-fuchsia-400">AI</span>Match
        </h1>
        <p className="mt-2 max-w-sm text-zinc-400">
          Swipe through LLMs like dating profiles. Match with the models that
          fit your needs.
        </p>
      </div>

      <form
        action={login}
        className="flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-white/10 bg-zinc-900/70 p-6"
      >
        <label htmlFor="email" className="text-sm text-zinc-300">
          Dev sign-in — enter any email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-fuchsia-400"
        />
        <button
          type="submit"
          className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold transition hover:bg-fuchsia-500"
        >
          Continue
        </button>
        <p className="text-xs text-zinc-500">
          No password needed. A user is created on first sign-in. Swap in
          GitHub/Google OAuth later in <code>lib/auth.ts</code>.
        </p>
      </form>
    </div>
  );
}
