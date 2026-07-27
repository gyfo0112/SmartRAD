"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import Logo from "@/components/ui/Logo";
import HashLink from "@/components/ui/HashLink";

const navigation: { label: string; href: `#${string}`; scrollBlock?: ScrollLogicalPosition }[] = [
  { label: "주요 기능", href: "#features" },
  { label: "장점", href: "#benefits" },
  { label: "요금제", href: "#pricing" },
  { label: "문의", href: "#contact", scrollBlock: "start" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    const closeOnDesktop = (event: MediaQueryListEvent) => {
      if (event.matches) setIsMenuOpen(false);
    };
    const desktopQuery = window.matchMedia("(min-width: 768px)");

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    desktopQuery.addEventListener("change", closeOnDesktop);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      desktopQuery.removeEventListener("change", closeOnDesktop);
    };
  }, [isMenuOpen]);

  const handleLogoClick = () => {
    setIsMenuOpen(false);
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-white shadow-[0_1px_0_rgba(16,42,80,0.06)] md:h-[84px]">
      <Container className="flex h-full items-center justify-between">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
          aria-label="SmartHR 홈"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white md:h-11 md:w-11 md:rounded-[14px]">
            <Logo className="h-5 w-5 md:h-6 md:w-6" />
          </span>
          <span className="text-lg font-bold text-brand-navy md:text-xl">SmartHR</span>
        </Link>

        <nav
          className="hidden items-center gap-5 md:flex lg:gap-8 xl:gap-12"
          aria-label="주요 메뉴"
        >
          {navigation.map((item) => (
            <HashLink
              key={item.href}
              href={item.href}
              scrollBlock={item.scrollBlock}
              className="group text-[15px] font-extrabold tracking-[0]"
            >
              <span className="text-brand-text transition-colors duration-300 ease-out group-hover:text-brand-primary motion-reduce:transition-none">
                {item.label}
              </span>
            </HashLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <Link
            href="/login"
            className="flex h-10 min-w-[72px] items-center justify-center whitespace-nowrap rounded-full bg-brand-primary px-4 text-sm font-semibold transition-colors duration-300 ease-out hover:bg-brand-primary-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/25 md:h-12 md:w-[104px] md:px-0 md:text-base motion-reduce:transition-none"
          >
            <span className="text-white">로그인</span>
          </Link>
          <button
            type="button"
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-brand-navy transition-[color,background-color,box-shadow,transform] duration-200 ease-out hover:bg-brand-soft active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/25 md:hidden motion-reduce:transform-none motion-reduce:transition-none"
          >
            <span className="relative block h-5 w-6" aria-hidden="true">
              <span
                className={`absolute left-0 top-px h-0.5 w-6 origin-center rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
                  isMenuOpen ? "translate-y-2 rotate-45" : "translate-y-0 rotate-0"
                }`}
              />
              <span
                className={`absolute left-0 top-[9px] h-0.5 w-6 origin-center rounded-full bg-current transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${
                  isMenuOpen
                    ? "scale-x-0 opacity-0"
                    : "scale-x-100 opacity-100"
                }`}
              />
              <span
                className={`absolute bottom-px left-0 h-0.5 w-6 origin-center rounded-full bg-current transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none ${
                  isMenuOpen
                    ? "-translate-y-2 -rotate-45"
                    : "translate-y-0 rotate-0"
                }`}
              />
            </span>
          </button>
        </div>
      </Container>
      {isMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-x-0 top-16 bottom-0 z-40 bg-brand-navy/20 backdrop-blur-[1px] md:hidden"
          />
          <nav
            id="mobile-navigation"
            aria-label="모바일 주요 메뉴"
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-brand-border bg-white px-4 py-3 shadow-[0_18px_36px_rgba(16,42,80,0.14)] md:hidden"
          >
            {navigation.map((item) => (
              <HashLink
                key={item.href}
                href={item.href}
                scrollBlock={item.scrollBlock}
                onClick={() => setIsMenuOpen(false)}
                className="flex min-h-12 w-full items-center rounded-xl px-3 text-[15px] font-extrabold text-brand-text transition-colors hover:bg-brand-soft hover:text-brand-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-primary/20"
              >
                {item.label}
              </HashLink>
            ))}
          </nav>
        </>
      ) : null}
    </header>
  );
}
