import Link from "next/link";
import { Logo } from "./Logo";

export const Footer = () => {
  return (
    <footer className="bg-muted text-foreground pt-24 pb-12 border-t border-border">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <Link href={"/"} className="flex items-center">
              <Logo type="green" />
            </Link>
            <p className="text-muted-foreground text-sm font-light leading-relaxed">
              The premier Life-OS for the modern socialite. Curating
              destinations and defining vibes since 2024.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Ecosystem
            </h4>
            <ul className="space-y-4 text-xs uppercase tracking-widest font-medium">
              <li>
                <Link href="/reservations" className="hover:text-muted-foreground transition-colors">
                  The Black Book
                </Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-muted-foreground transition-colors">
                  The Vault
                </Link>
              </li>
              <li>
                <Link href="/concierge" className="hover:text-muted-foreground transition-colors">
                  White Glove
                </Link>
              </li>
              <li>
                <Link href="/ticketing" className="hover:text-muted-foreground transition-colors">
                  Experiences
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact/Support */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Inquiries
            </h4>
            <ul className="space-y-4 text-xs tracking-widest">
              <li className="text-muted-foreground">
                Partnerships:{" "}
                <span className="text-foreground">partners@ekovibes.ng</span>
              </li>
              <li className="text-muted-foreground">
                Concierge: <span className="text-foreground">vip@ekovibes.ng</span>
              </li>
              <li className="text-muted-foreground">
                WhatsApp: <span className="text-foreground">+234 810 000 0000</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
              The Vibe List
            </h4>
            <p className="text-[10px] text-white/40 mb-4 uppercase tracking-widest">
              Join the inner circle for weekly drops.
            </p>
            <div className="flex border-b border-border pb-2">
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                className="bg-transparent border-none outline-none text-xs w-full placeholder:text-muted-foreground/40"
              />
              <button className="text-[10px] font-bold uppercase tracking-widest hover:text-muted-foreground transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-border gap-6">
          <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
            © 2026 Ekovibes Lifestyle Group. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] text-muted-foreground tracking-widest uppercase">
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/instagram" className="hover:text-white">
              Instagram
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
