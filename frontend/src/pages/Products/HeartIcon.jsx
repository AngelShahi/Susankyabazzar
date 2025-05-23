import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import {
  addToFavorites,
  removeFromFavorites,
  setFavorites,
} from '../../redux/features/favorites/favoriteSlice'
import {
  useAddToFavoritesMutation,
  useRemoveFromFavoritesMutation,
} from '../../redux/features/favorites/favoriteApiSlice'

const HeartIcon = ({ product }) => {
  const dispatch = useDispatch()
  const favorites = useSelector((state) => state.favorites) || []
  const isFavorite = favorites.some((p) => p._id === product._id)
  const [isDarkBackground, setIsDarkBackground] = useState(false)

  const [addToFavoriteAPI] = useAddToFavoritesMutation()
  const [removeFromFavoriteAPI] = useRemoveFromFavoritesMutation()

  // Check background color for icon visibility
  useEffect(() => {
    const checkBackground = () => {
      const element = document.getElementById(`heart-icon-${product._id}`)
      if (element) {
        const bgColor = window.getComputedStyle(
          element.parentElement
        ).backgroundColor
        const rgb = bgColor.match(/\d+/g)
        if (rgb) {
          const brightness = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]
          setIsDarkBackground(brightness < 128)
        }
      }
    }
    checkBackground()
  }, [product._id])

  const toggleFavorites = async () => {
    const userInfo = localStorage.getItem('userInfo')
    if (!userInfo) {
      alert('Please log in to save favorites')
      return
    }

    try {
      if (isFavorite) {
        await removeFromFavoriteAPI(product._id).unwrap()
        dispatch(removeFromFavorites(product))
      } else {
        await addToFavoriteAPI(product._id).unwrap()
        dispatch(addToFavorites(product))
      }
    } catch (error) {
      console.error('Error updating favorites:', error)
    }
  }

  return (
    <div
      id={`heart-icon-${product._id}`}
      className='absolute top-2 right-5 cursor-pointer transition-colors duration-200 hover:scale-110'
      onClick={toggleFavorites}
    >
      {isFavorite ? (
        <FaHeart
          className='text-pink-600 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'
          size={18}
        />
      ) : (
        <FaRegHeart
          className={
            isDarkBackground
              ? 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'
              : 'text-gray-900 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]'
          }
          size={18}
        />
      )}
    </div>
  )
}

export default HeartIcon
