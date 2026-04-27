import { useNavigate } from 'react-router-dom'

export default function BackButton({ to, label = 'Back' }) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (to) navigate(to)
    else navigate(-1)
  }

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white transition group mb-6">
      <span className="text-lg group-hover:-translate-x-1 transition-transform duration-150">←</span>
      {label}
    </button>
  )
}
