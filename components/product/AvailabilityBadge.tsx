interface AvailabilityBadgeProps {
  availability: "available" | "sold_out";
  size?: "sm" | "md";
}

export default function AvailabilityBadge({
  availability,
  size = "md",
}: AvailabilityBadgeProps) {
  const isAvailable = availability === "available";

  return (
    <span className={isAvailable ? "badge-available" : "badge-soldout"}>
      <span
        style={{
          width: size === "sm" ? "5px" : "6px",
          height: size === "sm" ? "5px" : "6px",
          borderRadius: "50%",
          background: isAvailable ? "var(--success)" : "var(--text-muted)",
          flexShrink: 0,
        }}
      />
      {isAvailable ? "Available" : "Sold Out"}
    </span>
  );
}
