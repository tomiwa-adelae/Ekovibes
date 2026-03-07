import type { Metadata } from "next";
import { getEventBySlug } from "@/lib/events-api";
import EventDetails from "./_components/EventDetails";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const event = await getEventBySlug(slug);
    const title = event.title;
    const description = event.description
      ? event.description.slice(0, 155)
      : `Get tickets to ${event.title}${event.venueName ? ` at ${event.venueName}` : ""}. Secure your spot on Ekovibe — instant QR delivery.`;

    return {
      title,
      description,
      openGraph: {
        title: `${title} | Ekovibe`,
        description,
        url: `https://www.ekovibe.com.ng/${slug}`,
        images: event.coverImage
          ? [{ url: event.coverImage, width: 1200, height: 630, alt: title }]
          : [{ url: "/assets/images/og-image.png", width: 1200, height: 630 }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | Ekovibe`,
        description,
        images: event.coverImage
          ? [event.coverImage]
          : ["/assets/images/og-image.png"],
      },
      alternates: {
        canonical: `https://www.ekovibe.com.ng/${slug}`,
      },
    };
  } catch {
    return {
      title: "Event | Ekovibe",
      description: "Discover and book tickets to exclusive events on Ekovibe.",
    };
  }
}

export default function EventDetailsPage() {
  return <EventDetails />;
}
