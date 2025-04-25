import { useSelector } from 'react-redux';

const CartCount = () => {
  const { cartItems } = useSelector((state) => state.cart);
  
  const cartItemsCount = cartItems.reduce((a, c) => a + c.qty, 0);
  
  return (
    <>
      {cartItems.length > 0 && (
        <span
          className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs text-white font-medium rounded-full"
          style={{ backgroundColor: 'rgb(211, 190, 249)' }}
        >
          {cartItemsCount}
        </span>
      )}
    </>
  );
};

export default CartCount;