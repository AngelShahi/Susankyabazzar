import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cartItems: [],
  shippingAddress: {},
  paymentMethod: '',
  itemsPrice: '0.00',
  shippingPrice: '0.00',
  taxPrice: '0.00',
  totalPrice: '0.00',
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action) => {
      state.cartItems = action.payload.cartItems || []
      state.shippingAddress = action.payload.shippingAddress || {}
      state.paymentMethod = action.payload.paymentMethod || ''
      state.itemsPrice = action.payload.itemsPrice || '0.00'
      state.shippingPrice = action.payload.shippingPrice || '0.00'
      state.taxPrice = action.payload.taxPrice || '0.00'
      state.totalPrice = action.payload.totalPrice || '0.00'
    },
    resetCart: (state) => {
      state.cartItems = []
      state.shippingAddress = {}
      state.paymentMethod = ''
      state.itemsPrice = '0.00'
      state.shippingPrice = '0.00'
      state.taxPrice = '0.00'
      state.totalPrice = '0.00'
    },
  },
})

export const { setCart, resetCart } = cartSlice.actions

export default cartSlice.reducer
