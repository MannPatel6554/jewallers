interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {icon && (
        <div className="mb-4 opacity-30" style={{ color: "var(--text-muted)" }}>
          {icon}
        </div>
      )}
      <h3
        className="text-2xl mb-2"
        style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
      >
        {title}
      </h3>
      {description && (
        <p className="text-sm mb-6 max-w-xs" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
