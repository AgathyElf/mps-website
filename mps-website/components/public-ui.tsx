import type { ComponentProps, ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";

export function Section({
  children,
  className = "",
  ...props
}: ComponentProps<"section">) {
  return (
    <section className={`section-pad ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <span className="section-kicker">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
      {description ? <p className="section-heading-note">{description}</p> : null}
    </div>
  );
}

export function ActionLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "light";
}) {
  return (
    <Link className={`button button-${variant}`} href={href}>
      {children}
    </Link>
  );
}

export function ProgramCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link className="quick-card program-card" href={href}>
      <div className="quick-card-top">
        <span aria-hidden="true">—</span>
        <BookOpen size={21} strokeWidth={1.5} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <span className="quick-card-link">
        Lihat detail <ArrowUpRight size={16} aria-hidden="true" />
      </span>
    </Link>
  );
}

export function ContentCard({
  title,
  description,
  note,
}: {
  title: string;
  description: string;
  note: string;
}) {
  return (
    <article className="content-card">
      <div className="content-card-mark" aria-hidden="true">
        —
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <p className="content-card-note">{note}</p>
    </article>
  );
}
