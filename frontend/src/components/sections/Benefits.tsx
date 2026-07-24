import Container from "@/components/ui/Container";
import SectionBadge from "@/components/ui/SectionBadge";

const benefits = [
  {
    number: "01",
    title: "압도적인 업무 효율",
    description: "수기 업무 및 단순 반복 업무를 줄여 인사팀이 더 중요한 업무에 집중할 수 있습니다.",
  },
  {
    number: "02",
    title: "합리적인 도입 비용",
    description: "복잡한 구축형 시스템 대비 낮은 비용의 클라우드 서비스로 빠르게 시작할 수 있습니다.",
  },
  {
    number: "03",
    title: "직관적인 사용성",
    description: "별도 교육 없이 누구나 바로 쓸 수 있도록 핵심 정보를 선명하게 보여주는 UI를 제공합니다.",
  },
  {
    number: "04",
    title: "강력한 데이터 보안",
    description: "민감한 인사 정보를 안전하게 암호화 보관하고 권한에 따라 접근을 제어합니다.",
  },
];

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="flex w-full items-center bg-[#F4F8FF] py-20 sm:py-28 lg:min-h-[calc(100vh-84px)] lg:py-32"
    >
      <Container>
        <SectionBadge>장점</SectionBadge>
        <h2 className="mt-6 break-keep text-[30px] font-extrabold leading-[1.25] tracking-[-1.5px] text-brand-navy sm:mt-7 sm:text-[46px] sm:tracking-[-3px]">
          인사팀이 체감하는 변화는 분명합니다
        </h2>
        <p className="mt-5 max-w-4xl break-words text-[15px] font-bold leading-7 text-brand-text sm:mt-6 sm:text-[16px]">
          수기 업무와 반복 확인을 줄이고, 합리적인 비용으로 안전하고 직관적인 인사관리 환경을 구축합니다.
        </p>
        <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 lg:mt-16 xl:mt-20 xl:grid-cols-4">
          {benefits.map((benefit) => (
            <article key={benefit.number} className="flex min-w-0 flex-col rounded-[24px] border border-[#E2ECFA] bg-white p-5 shadow-[0_16px_38px_rgba(50,94,160,0.07)] transition-all duration-300 ease-out sm:min-h-[250px] sm:p-6 [@media(hover:hover)]:md:hover:-translate-y-1 [@media(hover:hover)]:md:hover:border-[#C5D9F5] [@media(hover:hover)]:md:hover:shadow-[0_20px_44px_rgba(50,94,160,0.12)] xl:min-h-[270px] xl:p-[30px] motion-reduce:transform-none motion-reduce:transition-none">
              <span className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[16px] bg-brand-soft-strong text-[18px] font-bold text-brand-primary transition-colors duration-300 ease-out motion-reduce:transition-none">{benefit.number}</span>
              <h3 className="mt-6 text-[21px] font-extrabold text-brand-navy">{benefit.title}</h3>
              <p className="mt-3 text-[15px] font-semibold leading-[26px] text-brand-text">{benefit.description}</p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
