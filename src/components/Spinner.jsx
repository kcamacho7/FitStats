export default function Spinner({ className = '' }) {
  return (
    <svg className={`spinner ${className}`} viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        strokeWidth="3"
        stroke="currentColor"
        strokeDasharray="45 15"
        strokeLinecap="round"
      />
    </svg>
  )
}
