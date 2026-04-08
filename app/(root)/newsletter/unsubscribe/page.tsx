import Link from "next/link";
import { env } from "@/lib/env";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

async function unsubscribe(token: string) {
  const res = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/newsletter/unsubscribe?token=${token}`,
    { cache: "no-store" },
  );
  const data = await res.json();
  if (!res.ok) {
    return { success: false, message: data?.message ?? "Something went wrong." };
  }
  return { success: true, message: data?.message ?? "Unsubscribed." };
}

export default async function NewsletterUnsubscribePage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <Layout success={false} message="Invalid unsubscribe link." />;
  }

  const result = await unsubscribe(token);
  return <Layout success={result.success} message={result.message} />;
}

function Layout({ success, message }: { success: boolean; message: string }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
            The Vibe List
          </p>
          <h1 className="text-2xl font-bold">
            {success ? "You've been unsubscribed." : "Something went wrong."}
          </h1>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>

        {success && (
          <p className="text-xs text-muted-foreground/60">
            You won't receive any more emails from The Vibe List. You can always
            re-subscribe from the homepage.
          </p>
        )}

        <Link
          href="/"
          className="inline-block mt-4 px-6 py-3 border border-border text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-muted transition-colors"
        >
          Back to Ekovibe
        </Link>
      </div>
    </div>
  );
}
