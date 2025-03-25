import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa'

const Ratings = ({ value, text, color }) => {
  const fullStars = Math.floor(value)
  const halfStars = value - fullStars > 0.5 ? 1 : 0
  const emptyStar = 5 - fullStars - halfStars

  return (
    <div className='flex items-center gap-1'>
      {[...Array(fullStars)].map((_, index) => (
        <FaStar key={index} className={`text-${color}`} />
      ))}

      {halfStars === 1 && <FaStarHalfAlt className={`text-${color}`} />}

      {[...Array(emptyStar)].map((_, index) => (
        <FaRegStar key={index} className={`text-gray-300`} />
      ))}

      {text && <span className='ml-2 text-gray-600 text-sm'>{text}</span>}
    </div>
  )
}

Ratings.defaultProps = {
  color: 'yellow-400',
}

export default Ratings
