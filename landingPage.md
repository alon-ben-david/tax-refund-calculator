import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * NOTE ABOUT SANDBOX COMPATIBILITY
 * Some sandboxed environments throw a generic "Script error" when runtime APIs
 * (IntersectionObserver, requestAnimationFrame, etc.) or certain external
 * libraries are missing/blocked.
 *
 * This file is intentionally self-contained:
 * - No external icon libraries (inline SVG).
 * - No animation libraries.
 * - Defensive guards for window/document/IntersectionObserver.
 */

type IconProps = {
  className?: string;
  title?: string;
};

function SvgIconBase({
  children,
  className,
  title,
}: React.PropsWithChildren<IconProps>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={title ?? ""}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

function IconCheckCircle({ className, title }: IconProps) {
  return (
    <SvgIconBase className={className} title={title}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="M22 4 12 14.01l-3-3" />
    </SvgIconBase>
  );
}

function IconAlertTriangle({ className, title }: IconProps) {
  return (
    <SvgIconBase className={className} title={title}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </SvgIconBase>
  );
}

function IconFileText({ className, title }: IconProps) {
  return (
    <SvgIconBase className={className} title={title}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </SvgIconBase>
  );
}

function IconListChecks({ className, title }: IconProps) {
  return (
    <SvgIconBase className={className} title={title}>
      <path d="M10 6h11" />
      <path d="M10 12h11" />
      <path d="M10 18h11" />
      <path d="M3 6l1 1 2-2" />
      <path d="M3 12l1 1 2-2" />
      <path d="M3 18l1 1 2-2" />
    </SvgIconBase>
  );
}

function IconShield({ className, title }: IconProps) {
  return (
    <SvgIconBase className={className} title={title}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </SvgIconBase>
  );
}

function IconChevronDown({ className, title }: IconProps) {
  return (
    <SvgIconBase className={className} title={title}>
      <path d="m6 9 6 6 6-6" />
    </SvgIconBase>
  );
}

type Cta = { label: string; href: string; variant: "primary" | "secondary" };

type ContentModel = {
  hero: {
    title: string;
    subtitle: string;
    ctas: Cta[];
    highlights: Array<{
      icon: (p: IconProps) => React.ReactElement;
      iconTitle: string;
      title: string;
      text: string;
    }>;
  };
  sections: Array<Record<string, any>>;
  footer: {
    finalCtaTitle: string;
    finalCtaSubtitle: string;
    finalCtas: Cta[];
    finePrint: string[];
  };
};

function runSelfTests(model: ContentModel) {
  // In-file "test cases" to catch broken content structures early.
  // These should never crash the page in restrictive sandboxes.
  try {
    console.assert(!!model.hero?.title, "[LandingPage] hero.title must exist");
    console.assert(
      Array.isArray(model.hero?.ctas) && model.hero.ctas.length >= 1,
      "[LandingPage] hero.ctas should have at least one CTA"
    );
    console.assert(
      Array.isArray(model.sections) && model.sections.length >= 1,
      "[LandingPage] sections should exist"
    );
    console.assert(
      model.sections.every((s) => !!s?.title),
      "[LandingPage] every section must have a title"
    );

    const faq = model.sections.find((s) => s.id === "faq");
    if (faq) {
      console.assert(
        Array.isArray((faq as any).faqs) && (faq as any).faqs.length >= 1,
        "[LandingPage] FAQ section exists but has no items"
      );
    }

    // Additional tests
    const calc = model.sections.find((s) => s.id === "calculator");
    console.assert(
      !!calc,
      "[LandingPage] calculator section should exist (CTA points to it)"
    );
    console.assert(
      model.hero.ctas.every(
        (c) => typeof c.href === "string" && c.href.length > 0
      ),
      "[LandingPage] all CTAs must have href"
    );
    console.assert(
      model.footer.finalCtas.length >= 1,
      "[LandingPage] footer.finalCtas must have at least one CTA"
    );
  } catch {
    // swallow
  }
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function getSafeWindow(): Window | null {
  try {
    // eslint-disable-next-line no-restricted-globals
    return typeof window !== "undefined" ? window : null;
  } catch {
    return null;
  }
}

function getSafeDocument(): Document | null {
  try {
    // eslint-disable-next-line no-restricted-globals
    return typeof document !== "undefined" ? document : null;
  } catch {
    return null;
  }
}

function getHashId(): string {
  const w = getSafeWindow();
  const h = w?.location?.hash ?? "";
  return h.startsWith("#") ? h.slice(1) : "";
}

function useActiveSection(ids: string[], rootMargin = "-30% 0px -60% 0px") {
  const [activeId, setActiveId] = useState<string>(() => {
    const initialFromHash = getHashId();
    return ids.includes(initialFromHash) ? init