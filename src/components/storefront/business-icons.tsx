import type { ReactNode } from "react";

type IconProps = { className?: string };

const defaultClass = "h-[18px] w-[18px] shrink-0";

export function IconMapPin({ className = defaultClass }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.5 7-11a7 7 0 10-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" strokeWidth="1.75" />
    </svg>
  );
}

export function IconPhone({ className = defaultClass }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 4h2l1.5 5.5a1 1 0 00.95.72l3.08-.44a1 1 0 01.87.38l2.2 2.75a12.05 12.05 0 005.4 5.4l2.75-2.2a1 1 0 01.38-.87l-.44-3.08a1 1 0 00.72-.95L20 14v2a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"
      />
    </svg>
  );
}

export function IconMail({ className = defaultClass }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export function IconTruck({ className = defaultClass }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v8H3V7z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h3l3 3v2h-6v-5z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="17.5" cy="17.5" r="1.5" />
    </svg>
  );
}

export function IconPackage({ className = defaultClass }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 12l8-4.5M12 12v9M12 12L4 7.5" />
    </svg>
  );
}

export function BusinessIconBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800/90 bg-zinc-900/60 text-orange-400">
      {children}
    </span>
  );
}

export function BusinessContactRow({
  icon,
  children,
  href,
}: {
  icon: ReactNode;
  children: ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <BusinessIconBadge>{icon}</BusinessIconBadge>
      <span className="min-w-0 pt-0.5">{children}</span>
    </>
  );

  const rowClass = "flex items-start gap-3 text-zinc-300";

  if (href) {
    return (
      <a href={href} className={`${rowClass} transition hover:text-orange-400`}>
        {inner}
      </a>
    );
  }

  return <p className={rowClass}>{inner}</p>;
}
