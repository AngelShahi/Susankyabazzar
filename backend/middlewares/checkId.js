import { isValidObjectId } from 'mongoose'

function checkId(req, res, next) {
  // Skip validation for bulk-discount routes
  if (req.path.includes('bulk-discount')) {
    return next()
  }

  // Only validate if id parameter exists
  if (req.params.id && !isValidObjectId(req.params.id)) {
    res.status(404)
    throw new Error(`Invalid Object of: ${req.params.id}`)
  }

  next()
}

export default checkId
