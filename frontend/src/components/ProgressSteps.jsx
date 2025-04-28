import React from 'react'

const ProgressSteps = ({ step1, step2, step3 }) => {
  // Helper function to determine text color based on step completion
  const getStepStyle = (isCompleted) => ({
    color: isCompleted
      ? 'rgba(211, 190, 249, 0.9)'
      : 'rgba(128, 128, 128, 0.7)',
  })

  // Helper function to determine connector style based on step completion
  const getConnectorStyle = (isCompleted) => ({
    backgroundColor: isCompleted
      ? 'rgba(211, 190, 249, 0.9)'
      : 'rgba(128, 128, 128, 0.3)',
    height: '0.125rem',
    width: '10rem',
  })

  return (
    <div className='flex justify-center items-center space-x-4 mb-8 pt-4'>
      {/* Step 1 - Login */}
      <div className='flex flex-col items-center' style={getStepStyle(step1)}>
        <span className='text-sm md:text-base'>Login</span>
        {step1 && (
          <div
            className='mt-2 text-lg text-center'
            style={{ color: 'rgba(22, 163, 74, 0.9)' }}
          >
            ✓
          </div>
        )}
      </div>

      {/* Connector 1-2 */}
      <div style={getConnectorStyle(step1 && step2)}></div>

      {/* Step 2 - Shipping */}
      <div className='flex flex-col items-center' style={getStepStyle(step2)}>
        <span className='text-sm md:text-base'>Shipping</span>
        {step2 && (
          <div
            className='mt-2 text-lg text-center'
            style={{ color: 'rgba(22, 163, 74, 0.9)' }}
          >
            ✓
          </div>
        )}
      </div>

      {/* Connector 2-3 */}
      <div style={getConnectorStyle(step2 && step3)}></div>

      {/* Step 3 - Summary/Place Order */}
      <div className='flex flex-col items-center' style={getStepStyle(step3)}>
        <span className='text-sm md:text-base'>Summary</span>
        {step3 && (
          <div
            className='mt-2 text-lg text-center'
            style={{ color: 'rgba(22, 163, 74, 0.9)' }}
          >
            ✓
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressSteps
