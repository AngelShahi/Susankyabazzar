// components/auth/AuthListener.jsx
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { clearFavorites } from '../../redux/features/favorites/favoriteSlice'
import { useGetFavoritesQuery } from '../../redux/features/favorites/favoriteApiSlice'

// This component can be mounted at the app level to handle auth state changes
const AuthListener = () => {
  const dispatch = useDispatch()
  const { refetch } = useGetFavoritesQuery()

  useEffect(() => {
    // Function to handle user auth changes
    const handleAuthChange = () => {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))

      if (userInfo) {
        // User is logged in, fetch their favorites
        refetch()
      } else {
        // User logged out, clear favorites from redux store
        dispatch(clearFavorites())
      }
    }

    // Set up listener for storage events (for when userInfo changes)
    window.addEventListener('storage', handleAuthChange)

    // Initial check
    handleAuthChange()

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [dispatch, refetch])

  // This is a utility component that doesn't render anything
  return null
}

export default AuthListener
