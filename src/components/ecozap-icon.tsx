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
      {/* Chat bubble outline with tail */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.5 2C4.01 2 2 4.01 2 6.5v7C2 15.99 4.01 18 6.5 18H7v2.88c0 .69.84 1.04 1.33.55L11.67 18H17.5c2.49 0 4.5-2.01 4.5-4.5v-7C22 4.01 19.99 2 17.5 2h-11zM4 6.5C4 5.12 5.12 4 6.5 4h11C18.88 4 20 5.12 20 6.5v7c0 1.38-1.12 2.5-2.5 2.5h-6.33L9 18.13V16H6.5C5.12 16 4 14.88 4 13.5v-7z"
      />
      {/* Leaf */}
      <path
        d="M12 6.5c-2.8.7-4.8 3.2-4.5 6.5.7-.9 1.8-1.7 3.1-2.1-.2 1.4 0 2.8.9 4 .9-1.2 1.1-2.6.9-4 1.3.4 2.4 1.2 3.1 2.1.3-3.3-1.7-5.8-3.5-6.5z"
      />
    </svg>
  )
}
