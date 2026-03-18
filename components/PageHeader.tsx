type PageHeaderProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle ? <p className="text-zinc-600 mt-1">{subtitle}</p> : null}
        </div>
        {right ? <div className="hidden md:flex items-center gap-2">{right}</div> : null}
      </div>
    </div>
  );
}
