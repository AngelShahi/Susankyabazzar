import { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import {
  addToFavorites,
  removeFromFavorites,
  setFavorites,
} from '../../redux/features/favorites/favoriteSlice';

import {
  addFavoriteToLocalStorage,
  getFavoritesFromLocalStorage,
  removeFavoriteFromLocalStorage,
} from '../../Utils/localStorage';

const HeartIcon = ({ product }) => {
  const dispatch = useDispatch();
  const favorites = useSelector((state) => state.favorites) || [];
  const isFavorite = favorites.some((p) => p._id === product._id);
  const [isDarkBackground, setIsDarkBackground] = useState(false);

  useEffect(() => {
    const favoritesFromLocalStorage = getFavoritesFromLocalStorage();
    dispatch(setFavorites(favoritesFromLocalStorage));
  }, [dispatch]);

  useEffect(() => {
    // Check background color dynamically
    const checkBackground = () => {
      const element = document.getElementById(`heart-icon-${product._id}`);
      if (element) {
        const bgColor = window.getComputedStyle(element.parentElement).backgroundColor;
        const rgb = bgColor.match(/\d+/g);
        if (rgb) {
          const brightness = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]);
          setIsDarkBackground(brightness < 128);
        }
      }
    };
    checkBackground();
  }, [product._id]);

  const toggleFavorites = () => {
    if (isFavorite) {
      dispatch(removeFromFavorites(product));
      removeFavoriteFromLocalStorage(product._id);
    } else {
      dispatch(addToFavorites(product));
      addFavoriteToLocalStorage(product);
    }
  };

  return (
    <div
      id={`heart-icon-${product._id}`}
      className='absolute top-2 right-5 cursor-pointer'
      onClick={toggleFavorites}
    >
      {isFavorite ? (
        <FaHeart className='text-pink-500 drop-shadow-md' />
      ) : (
        <FaRegHeart
          className={
            isDarkBackground ? 'text-gray-200 drop-shadow-md' : 'text-gray-600 drop-shadow-md'
          }
        />
      )}
    </div>
  );
};

export default HeartIcon;