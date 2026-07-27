"use client";

import { AnchorHTMLAttributes, MouseEvent } from "react";

interface HashLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: `#${string}`;
  /** 대상 섹션을 뷰포트의 어디에 맞출지. 기본은 중앙(center).
   *  섹션 자체에 배경색 구분이 있어 그 경계에 맞춰야 하는 경우 "start"를 사용. */
  scrollBlock?: ScrollLogicalPosition;
}

export default function HashLink({ href, scrollBlock = "center", onClick, ...props }: HashLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(href.slice(1));

    if (target) {
      e.preventDefault();
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: scrollBlock,
      });
      window.history.pushState(null, "", href);
    }

    onClick?.(e);
  };

  return <a href={href} onClick={handleClick} {...props} />;
}
