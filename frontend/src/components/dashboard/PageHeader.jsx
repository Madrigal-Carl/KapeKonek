export function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="mb-8 border-b border-border pb-6">
      {eyebrow && <p className="label-mono mb-2 text-accent">{eyebrow}</p>}
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">
        {title}
      </h1>
      {description && (
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
