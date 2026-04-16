interface EcoZapIconProps {
  className?: string
}

export function EcoZapIcon({ className }: EcoZapIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="EcoZap"
    >
      {/* Leaf silhouette */}
      <path d="M12 2C8.5 2 5 5.5 5 10c0 3 1.5 5.5 3.8 7L9 20h6l.2-3C17.5 15.5 19 13 19 10c0-4.5-3.5-8-7-8z" />
      {/* Lightning bolt highlight */}
      <path
        d="M13.5 8.5l-3.5 5.5h2.8l-1.3 4 4.5-6.5H13l.5-3z"
        fill="white"
        opacity="0.35"
      />
    </svg>
  )
}
