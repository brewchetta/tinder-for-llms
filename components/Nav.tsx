import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export async function Nav() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
      <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          <span className="text-fuchsia-400">AI</span>Match
        </Link>

        {session?.user ? (
          <div className="flex items-center gap-4 text-sm">
            <Link href="/swipe" className="text-zinc-300 hover:text-white">
              Swipe
            </Link>
            <Link href="/matches" className="text-zinc-300 hover:text-white">
              Matches
            </Link>
            <span className="hidden text-zinc-500 sm:inline">
              {session.user.email}
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/sign-in" });
              }}
            >
              <button className="rounded-full border border-white/15 px-3 py-1 text-zinc-300 hover:bg-white/10">
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/sign-in"
            className="rounded-full bg-fuchsia-600 px-4 py-1.5 text-sm font-semibold hover:bg-fuchsia-500"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
