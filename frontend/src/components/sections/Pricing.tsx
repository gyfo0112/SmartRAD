import Container from "@/components/ui/Container";
import HashLink from "@/components/ui/HashLink";
import SectionBadge from "@/components/ui/SectionBadge";
import CountUp from "@/components/ui/CountUp";

const plans = [
  {
    badge: "Starter",
    title: "스터터 플랜",
    description: "인사 관리를 막 시작하는 소규모 팀을 위한 기본 플랜입니다.",
    price: "₩15,000",
    suffix: "/ 월",
    features: ["직원 정보 관리", "기본 근태 관리", "휴가 요청 관리"],
    button: "상담하기",
  },
  {
    badge: "Business",
    title: "비즈니스 플랜",
    description: "체계가 필요한 성장형 중소기업을 위한 추천 플랜입니다.",
    price: "₩29,000",
    suffix: "/ 월",
    features: ["조직·구성원 관리", "근태·휴가 승인", "급여 정산 자동화"],
    button: "시작하기",
    recommended: true,
  },
  {
    badge: "Enterprise",
    title: "엔터프라이즈",
    description: "맞춤형 기능이 필요한 대규모 기업을 위한 별도 상담 플랜입니다.",
    price: "별도 문의",
    suffix: "",
    features: ["맞춤형 기능 설계", "전담 도입 컨설팅", "보안 정책 지원"],
    button: "문의하기",
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="w-full bg-white py-20 sm:py-28 lg:py-32">
      <Container>
        <div className="reveal-on-scroll text-center">
          <SectionBadge>요금제</SectionBadge>
          <h2 className="mt-6 break-keep text-[30px] font-extrabold leading-[1.3] tracking-[-1.5px] text-brand-navy sm:text-[46px] sm:leading-[1.35] sm:tracking-[-3px]">
            <span className="sm:block">기업 규모에 맞는 플랜으로 </span>
            <span className="sm:block">시작하세요</span>
          </h2>
          <p className="mx-auto mt-5 max-w-4xl break-words text-[15px] font-bold leading-7 text-brand-text sm:mt-8 sm:text-[16px] lg:mt-10">인사 관리를 막 시작하는 팀부터 맞춤형 기능이 필요한 대규모 기업까지, 필요한 범위에 맞춰 선택할 수 있습니다.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:mt-20 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <article
              key={plan.badge}
              style={{ animationDelay: `${index * 100}ms` }}
              className={`reveal-on-scroll group relative flex min-w-0 flex-col rounded-[26px] border bg-white p-5 text-brand-navy transition-all duration-300 ease-out sm:p-8 md:last:col-span-2 md:last:mx-auto md:last:w-full md:last:max-w-[calc(50%_-_0.75rem)] lg:min-h-[528px] lg:p-9 lg:last:col-span-1 lg:last:max-w-none [@media(hover:hover)]:hover:z-10 [@media(hover:hover)]:hover:border-brand-primary [@media(hover:hover)]:hover:bg-gradient-to-br [@media(hover:hover)]:hover:from-brand-primary-deep [@media(hover:hover)]:hover:via-[#246BFE] [@media(hover:hover)]:hover:to-brand-primary-light [@media(hover:hover)]:hover:text-white [@media(hover:hover)]:hover:shadow-xl [@media(hover:hover)]:md:hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none ${
                plan.recommended
                  ? "animate-pulse-ring border-brand-primary"
                  : "border-brand-border"
              }`}
            >
              {plan.recommended && (
                <span className="absolute -top-3.5 left-1/2 w-fit -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-primary px-4 py-1.5 text-[11px] font-extrabold text-white shadow-[0_6px_16px_rgba(36,107,254,0.35)]">
                  🔥 가장 많이 선택하는 플랜
                </span>
              )}
              <span className="w-fit rounded-full bg-brand-soft-strong px-3 py-2 text-[11px] font-bold text-brand-primary transition-colors duration-300 ease-out group-hover:bg-white/15 group-hover:text-white motion-reduce:transition-none">{plan.badge}</span>
              <h3 className="mt-6 text-[27px] font-extrabold text-brand-navy transition-colors duration-300 ease-out group-hover:text-white motion-reduce:transition-none">{plan.title}</h3>
              <p className="mt-3 text-[14px] font-semibold leading-6 text-brand-text transition-colors duration-300 ease-out group-hover:text-white/75 lg:min-h-[48px] motion-reduce:transition-none">{plan.description}</p>
              <p className="mt-8 flex min-w-0 flex-wrap items-end gap-1 text-brand-navy transition-colors duration-300 ease-out group-hover:text-white lg:mt-12 motion-reduce:transition-none"><CountUp value={plan.price} className="break-keep text-[34px] font-extrabold tracking-[-1.5px] sm:text-[38px] lg:text-[42px] lg:tracking-[-2px]" />{plan.suffix && <span className="shrink-0 pb-2 text-[12px] font-bold text-brand-muted transition-colors duration-300 ease-out group-hover:text-white/70 motion-reduce:transition-none">{plan.suffix}</span>}</p>
              <ul className="mt-6 space-y-3 text-[14px] font-bold text-brand-text transition-colors duration-300 ease-out group-hover:text-white/85 motion-reduce:transition-none">
                {plan.features.map((feature) => <li key={feature}>{`✓ ${feature}`}</li>)}
              </ul>
              <HashLink href="#contact" scrollBlock="start" className="mt-8 flex h-[54px] items-center justify-center rounded-[14px] border border-transparent bg-brand-navy text-[15px] font-extrabold transition-colors duration-300 ease-out group-hover:bg-white lg:mt-auto motion-reduce:transition-none">
                <span className="text-white transition-colors duration-300 ease-out group-hover:text-brand-primary motion-reduce:transition-none">
                  {plan.button}
                </span>
              </HashLink>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
