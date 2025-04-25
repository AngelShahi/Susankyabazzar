import { useSelector } from 'react-redux'

const FavoritesCount = () => {
  const favorites = useSelector((state) => state.favorites)
  const favoriteCount = favorites.length

  return (
    <div>
      {favoriteCount > 0 && (
        <span
          className='absolute -top-2 -right-2 px-1.5 py-0.5 text-xs text-white font-medium rounded-full'
          style={{ backgroundColor: 'rgb(211, 190, 249)' }}
        >
          {favoriteCount}
        </span>
      )}
    </div>
  )
}

export default FavoritesCount
