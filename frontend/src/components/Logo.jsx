export default function Logo({ size = 'md', showText = true }) {
  const sizes = {
    sm: { icon: 28, text: 'text-lg' },
    md: { icon: 36, text: 'text-2xl' },
    lg: { icon: 52, text: 'text-4xl' },
  }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-2.5">
      {/* Icon mark */}
      <svg width={s.icon} height={s.icon} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Outer hexagon shape */}
        <path
          d="M20 2L36 11V29L20 38L4 29V11L20 2Z"
          fill="#00C853"
          fillOpacity="0.12"
          stroke="#00C853"
          strokeWidth="1.5"
        />
        {/* J letterform */}
        <path
          d="M22 10H26V24C26 27.3 23.3 30 20 30C16.7 30 14 27.3 14 24V22H18V24C18 25.1 18.9 26 20 26C21.1 26 22 25.1 22 24V10Z"
          fill="#00C853"
        />
        {/* Checkmark tick — verification symbol */}
        <path
          d="M13 19L17 23L27 13"
          stroke="#00C853"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />
      </svg>

      {showText && (
        <span className={`font-extrabold tracking-tight ${s.text} text-white`}>
          Job<span className="text-primary">ify</span>
        </span>
      )}
    </div>
  )
}
