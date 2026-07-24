type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full min-w-0 max-w-[1440px] px-4 sm:px-6 lg:px-8 min-[1504px]:px-0 ${className}`}
    >
      {children}
    </div>
  );
}
