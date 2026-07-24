import Image from "next/image"
import Container from "@/components/ui/Container"
import HashLink from "@/components/ui/HashLink"
import SectionBadge from "@/components/ui/SectionBadge"

const highlights = [
  { title: "4 Core", description: "핵심 HR 기능 통합" },
  {
    title: "1/10",
    description: "구축 대비 합리적 비용",
  },
  {
    title: "Secure",
    description: "민감 정보 암호화 보관",
  },
]

export default function Hero() {
  return (
    <section className="w-full bg-[radial-gradient(circle_at_82%_8%,var(--color-brand-soft-strong)_0%,#F5F9FF_26%,#FFFFFF_58%)]">
      <Container className="flex flex-col items-center gap-10 py-14 sm:gap-12 sm:py-20 lg:flex-row lg:gap-16">
        <div className="w-full min-w-0 max-w-[540px] lg:shrink-0">
          <SectionBadge className="mb-6 tracking-[0] sm:mb-7">
            기업 인사관리를 위한 HR ERP
          </SectionBadge>

          <h1 className="break-keep text-[36px] font-bold leading-[1.12] tracking-[-2.5px] min-[380px]:text-[40px] sm:text-[52px] sm:leading-[58px] sm:tracking-[-5px] lg:text-[60px] lg:leading-[65px] lg:tracking-[-7px]">
            <span className="block text-brand-navy">
              인사관리의
            </span>
            <span className="block text-brand-navy">흐름을</span>
            <span className="block text-brand-primary">하나로</span>
            <span className="block text-brand-primary">
              연결합니다.
            </span>
          </h1>

          <p className="mt-6 max-w-[530px] break-words text-base font-bold leading-7 tracking-[0] text-brand-text sm:mt-8 sm:text-[22px] sm:leading-[35.6px]">
            <span className="sm:block">
              직원 정보, 조직, 근태, 휴가, 급여 정산까지.
            </span>
            <span className="sm:block">
              SmartHR은 기업 인사관리에 필요한 핵심 업무를
            </span>
            <span className="sm:block">
              직관적인 화면과 자동화된 흐름으로 제공합니다.
            </span>
          </p>

          <div className="mt-8 grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:mt-[42px] sm:gap-[14px]">
            <HashLink
              href="#features"
              className="flex h-[52px] w-full items-center justify-center whitespace-nowrap rounded-full bg-brand-primary px-5 text-[14px] font-extrabold transition-colors duration-300 ease-out hover:bg-brand-primary-dark sm:h-[54px] sm:px-8 sm:text-[15px] motion-reduce:transition-none"
            >
              <span className="text-white">주요 기능 보기</span>
            </HashLink>
            <HashLink
              href="#contact"
              scrollBlock="start"
              className="flex h-[52px] w-full items-center justify-center whitespace-nowrap rounded-full border border-brand-border-light bg-white px-5 text-[14px] font-extrabold transition-colors duration-300 ease-out hover:bg-brand-soft sm:h-[54px] sm:px-8 sm:text-[15px] motion-reduce:transition-none"
            >
              <span className="text-brand-blue-text">도입 상담 요청</span>
            </HashLink>
          </div>

          <div className="mt-9 grid grid-cols-1 gap-3 sm:mt-11 sm:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="min-h-[76px] min-w-0 rounded-[18px] border border-brand-border bg-white px-4 py-4 shadow-[0_12px_30px_rgba(50,94,160,0.07)] sm:min-h-[84px] sm:px-[18px]"
              >
                <p className="text-[24px] font-extrabold leading-none text-brand-navy">
                  {item.title}
                </p>
                <p className="mt-2 break-keep text-[12px] font-bold leading-4 text-brand-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex w-full min-w-0 flex-1 items-center justify-center lg:justify-end">
          <Image
            src="/hero-dashboard.svg"
            alt="SmartHR 인사관리 대시보드 화면"
            width={3844}
            height={3120}
            priority
            sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 48px), 750px"
            className="h-auto w-full max-w-[680px] object-contain lg:max-w-[750px]"
          />
        </div>
      </Container>
    </section>
  )
}
