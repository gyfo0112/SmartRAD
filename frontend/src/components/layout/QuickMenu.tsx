"use client"

import Image from "next/image"
import Link from "next/link"
import HashLink from "@/components/ui/HashLink"

const quickMenus = [
  {
    label: "로그인",
    href: "/login",
    icon: "/icons/quick-menu/login.svg",
    isHash: false,
  },
  {
    label: "문의하기",
    href: "#contact",
    icon: "/icons/quick-menu/contact.svg",
    isHash: true,
  },
] as const

const buttonClassName = `
  group
  flex h-11 w-11
  cursor-pointer items-center justify-center
  rounded-[16px]
  border border-brand-border
  bg-white
  shadow-[0_12px_28px_rgba(50,94,160,0.12)]
  transition-all duration-300 ease-out

  hover:-translate-y-1
  hover:border-transparent
  hover:bg-gradient-to-br
  hover:from-brand-primary-deep
  hover:to-brand-primary-light
  hover:shadow-[0_16px_32px_rgba(36,107,254,0.28)]

  active:translate-y-0
  active:scale-95
  active:border-transparent
  active:bg-gradient-to-br
  active:from-brand-primary-deep
  active:to-brand-primary-light

  focus-visible:border-transparent
  focus-visible:bg-gradient-to-br
  focus-visible:from-brand-primary-deep
  focus-visible:to-brand-primary-light
  focus-visible:outline-none
  focus-visible:ring-4
  focus-visible:ring-brand-primary/25

  motion-reduce:transform-none
  motion-reduce:transition-none

  xl:h-[52px]
  xl:w-[52px]
`

const iconClassName = `
  h-5 w-5
  object-contain
  transition-[filter] duration-300 ease-out

  group-hover:brightness-0
  group-hover:invert

  group-active:brightness-0
  group-active:invert

  group-focus-visible:brightness-0
  group-focus-visible:invert

  motion-reduce:transition-none

  xl:h-6 xl:w-6
`

export default function QuickMenu() {
  const handleScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <aside
      aria-label="빠른 메뉴"
      className="fixed right-5 bottom-10 z-40 hidden flex-col items-center lg:flex xl:right-8"
    >
      <div className="flex flex-col gap-4">
        {quickMenus.map((menu) => {
          const icon = (
            <Image
              src={menu.icon}
              alt=""
              width={22}
              height={22}
              aria-hidden="true"
              className={iconClassName}
            />
          )

          return menu.isHash ? (
            <HashLink
              key={menu.label}
              href={menu.href}
              scrollBlock="start"
              aria-label={menu.label}
              className={buttonClassName}
            >
              {icon}
            </HashLink>
          ) : (
            <Link
              key={menu.label}
              href={menu.href}
              aria-label={menu.label}
              className={buttonClassName}
            >
              {icon}
            </Link>
          )
        })}

        <button
          type="button"
          aria-label="페이지 맨 위로 이동"
          onClick={handleScrollTop}
          className={buttonClassName}
        >
          <Image
            src="/icons/quick-menu/top.svg"
            alt=""
            width={22}
            height={22}
            aria-hidden="true"
            className={iconClassName}
          />
        </button>
      </div>
    </aside>
  )
}
