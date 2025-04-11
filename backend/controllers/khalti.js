const axios = require('axios')

// Check environment variables on startup
function checkEnvironmentVariables() {
  const requiredVars = [
    'KHALTI_SECRET_KEY',
    'KHALTI_GATEWAY_URL',
    'BACKEND_URI',
  ]
  const missing = requiredVars.filter((varName) => !process.env[varName])

  if (missing.length > 0) {
    console.error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
    throw new Error(
      'Missing required environment variables for Khalti integration'
    )
  }
}

// Function to verify Khalti Payment
async function verifyKhaltiPayment(pidx) {
  checkEnvironmentVariables()

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
    throw new Error(
      error.response?.data?.detail || 'Failed to verify payment with Khalti'
    )
  }
}

// Function to initialize Khalti Payment
async function initializeKhaltiPayment(details) {
  checkEnvironmentVariables()

  // Validate required fields
  const requiredFields = [
    'amount',
    'purchase_order_id',
    'purchase_order_name',
    'return_url',
  ]

  for (const field of requiredFields) {
    if (!details[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

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
    throw new Error(
      error.response?.data?.detail || 'Failed to initialize payment with Khalti'
    )
  }
}

module.exports = {
  verifyKhaltiPayment,
  initializeKhaltiPayment,
}
