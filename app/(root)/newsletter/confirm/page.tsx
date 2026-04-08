import Link from "next/link";
import { env } from "@/lib/env";

interface Props {
  searchParams: Promise<{ token?: string }>;
}

async function confirmNewsletter(token: string) {
  const res = await fetch(
    `${env.NEXT_PUBLIC_BACKEND_URL}/newsletter/confirm?token=${token}`,
    { cache: "no-store" },
  );
  const data = await res.json();
  if (!res.ok) {
    return { success: false, message: data?.message ?? "Something went wrong." };
  }
  return { success: true, message: data?.message ?? "Confirmed!" };
}

export default async function NewsletterConfirmPage({ searchParams }: Props) {
  const { token } = await searchParams;

  if (!token) {
    return <ConfirmLayout success={false} message="Invalid confirmation link." />;
  }

  const result = await confirmNewsletter(token);
  return <ConfirmLayout success={result.success} message={result.message} />;
}

function ConfirmLayout({
  success,
  message,
}: {
  success: boolean;
  message: string;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-1">
          <p className="text-[10px] font-bold tracking-widest uppercase text-primary">
            The Vibe List
          </p>
          <h1 className="text-2xl font-bold">
            {success ? "You're in." : "Something went wrong."}
          </h1>
        </div>

        <p className="text-muted-foreground text-sm leading-relaxed">{message}</p>

        {success && (
          <p className="text-xs text-muted-foreground/60">
            Every week you'll get the most curated events, early access, and
            lifestyle picks — straight to your inbox.
          </p>
        )}

        <Link
          href="/ticketing"
          className="inline-block mt-4 px-6 py-3 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity"
        >
          Explore Experiences
        </Link>
      </div>
    </div>
  );
}
