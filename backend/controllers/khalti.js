import axios from 'axios'

/**
 * Initialize a payment transaction with Khalti
 * @param {Object} details - Payment details
 * @param {number} details.amount - Amount in paisa (Rs * 100)
 * @param {string} details.purchase_order_id - Order ID for verification
 * @param {string} details.purchase_order_name - Name of the order
 * @param {string} details.return_url - Callback URL after payment
 * @param {string} details.website_url - Website URL
 * @returns {Promise<Object>} - Payment initialization response
 */
export async function initializeKhaltiPayment(details) {
  const headersList = {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    'Content-Type': 'application/json',
  }

  const bodyContent = JSON.stringify(details)

  const reqOptions = {
    url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/initiate/`,
    method: 'POST',
    headers: headersList,
    data: bodyContent,
  }

  try {
    const response = await axios.request(reqOptions)
    return response.data
  } catch (error) {
    console.error(
      'Error initializing Khalti payment:',
      error.response?.data || error.message
    )
    throw error
  }
}

/**
 * Verify a Khalti payment transaction
 * @param {string} pidx - Payment ID
 * @returns {Promise<Object>} - Payment verification response
 */
export async function verifyKhaltiPayment(pidx) {
  const headersList = {
    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
    'Content-Type': 'application/json',
  }

  const bodyContent = JSON.stringify({ pidx })

  const reqOptions = {
    url: `${process.env.KHALTI_GATEWAY_URL}/api/v2/epayment/lookup/`,
    method: 'POST',
    headers: headersList,
    data: bodyContent,
  }

  try {
    const response = await axios.request(reqOptions)
    return response.data
  } catch (error) {
    console.error(
      'Error verifying Khalti payment:',
      error.response?.data || error.message
    )
    throw error
  }
}
