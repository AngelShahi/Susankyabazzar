import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  useGetMyOrdersQuery,
  useUploadPaymentProofMutation,
  useCancelOrderMutation,
} from '../slices/ordersApiSlice'
import {
  Button,
  Row,
  Col,
  Table,
  Card,
  Badge,
  Spinner,
  Form,
  Modal,
} from 'react-bootstrap'
import { toast } from 'react-toastify'
import Message from '../components/Message'
import FileUpload from '../components/FileUpload'

const OrderHistoryScreen = () => {
  const { data: orders, isLoading, error, refetch } = useGetMyOrdersQuery()

  const [uploadPaymentProof] = useUploadPaymentProofMutation()
  const [cancelOrder] = useCancelOrderMutation()
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)

  // For filtering and sorting
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')

  // Handle payment proof upload
  const uploadFileHandler = async (uploadedImage) => {
    setImage(uploadedImage)
  }

  const submitPaymentProof = async () => {
    if (!image) {
      toast.error('Please upload an image first')
      return
    }

    try {
      const res = await uploadPaymentProof({
        orderId: selectedOrder._id,
        imageUrl: image,
      }).unwrap()

      toast.success('Payment proof uploaded successfully')
      setShowUploadModal(false)
      setImage('')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Something went wrong')
    }
  }

  // Handle order cancellation
  const handleCancelOrder = async () => {
    try {
      await cancelOrder({
        orderId: selectedOrder._id,
        reason: cancelReason,
      }).unwrap()

      toast.success('Order cancelled successfully')
      setShowCancelModal(false)
      setCancelReason('')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || err.error || 'Failed to cancel order')
    }
  }

  // Filter orders based on status
  const getFilteredOrders = () => {
    if (!orders) return []

    let filtered = [...orders]

    if (filterStatus === 'paid') {
      filtered = filtered.filter((order) => order.isPaid)
    } else if (filterStatus === 'unpaid') {
      filtered = filtered.filter((order) => !order.isPaid)
    } else if (filterStatus === 'delivered') {
      filtered = filtered.filter((order) => order.isDelivered)
    } else if (filterStatus === 'processing') {
      filtered = filtered.filter((order) => order.isPaid && !order.isDelivered)
    } else if (filterStatus === 'cancelled') {
      filtered = filtered.filter((order) => order.isCancelled)
    }

    // Sort orders
    if (sortOrder === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    } else if (sortOrder === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    } else if (sortOrder === 'highest') {
      filtered.sort((a, b) => b.totalPrice - a.totalPrice)
    } else if (sortOrder === 'lowest') {
      filtered.sort((a, b) => a.totalPrice - b.totalPrice)
    }

    return filtered
  }

  return (
    <Row className='py-3'>
      <Col>
        <h2>My Order History</h2>

        {isLoading ? (
          <Spinner animation='border' />
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <>
            <Row className='mb-3'>
              <Col md={6} className='mb-2'>
                <Form.Group>
                  <Form.Label>Filter by Status</Form.Label>
                  <Form.Control
                    as='select'
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value='all'>All Orders</option>
                    <option value='paid'>Paid</option>
                    <option value='unpaid'>Awaiting Payment</option>
                    <option value='delivered'>Delivered</option>
                    <option value='processing'>Processing</option>
                    <option value='cancelled'>Cancelled</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={6} className='mb-2'>
                <Form.Group>
                  <Form.Label>Sort By</Form.Label>
                  <Form.Control
                    as='select'
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value='newest'>Newest First</option>
                    <option value='oldest'>Oldest First</option>
                    <option value='highest'>Highest Price</option>
                    <option value='lowest'>Lowest Price</option>
                  </Form.Control>
                </Form.Group>
              </Col>
            </Row>

            {getFilteredOrders().length === 0 ? (
              <Message>No orders found</Message>
            ) : (
              <Table striped hover responsive className='table-sm'>
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th>DATE</th>
                    <th>TOTAL</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredOrders().map((order) => (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>{order.createdAt.substring(0, 10)}</td>
                      <td>${order.totalPrice}</td>
                      <td>
                        {order.isCancelled ? (
                          <Badge bg='danger'>Cancelled</Badge>
                        ) : order.isDelivered ? (
                          <Badge bg='success'>Delivered</Badge>
                        ) : order.isPaid ? (
                          <Badge bg='info'>Processing</Badge>
                        ) : order.paymentProofImage ? (
                          <Badge bg='warning'>Payment Proof Uploaded</Badge>
                        ) : (
                          <Badge bg='secondary'>Awaiting Payment</Badge>
                        )}
                      </td>
                      <td>
                        <div className='d-flex flex-column gap-2'>
                          <Link to={`/order/${order._id}`}>
                            <Button variant='light' size='sm'>
                              Details
                            </Button>
                          </Link>

                          {!order.isPaid &&
                            !order.isCancelled &&
                            !order.paymentProofImage && (
                              <Button
                                size='sm'
                                variant='outline-primary'
                                onClick={() => {
                                  setSelectedOrder(order)
                                  setShowUploadModal(true)
                                }}
                              >
                                Upload Payment
                              </Button>
                            )}

                          {!order.isPaid && !order.isCancelled && (
                            <Button
                              size='sm'
                              variant='outline-danger'
                              onClick={() => {
                                setSelectedOrder(order)
                                setShowCancelModal(true)
                              }}
                            >
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </>
        )}
      </Col>

      {/* Payment Proof Upload Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Payment Proof</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Order ID: {selectedOrder?._id}</p>
          <p>Total Amount: ${selectedOrder?.totalPrice}</p>

          <FileUpload onFileSelect={uploadFileHandler} uploading={uploading} />

          {image && (
            <div className='mt-3'>
              <p>Preview:</p>
              <img
                src={image}
                alt='Payment proof'
                style={{ maxWidth: '100%' }}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='secondary'
            onClick={() => {
              setShowUploadModal(false)
              setImage('')
            }}
          >
            Close
          </Button>
          <Button
            variant='primary'
            onClick={submitPaymentProof}
            disabled={!image || uploading}
          >
            {uploading ? 'Uploading...' : 'Submit'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancel Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel order #{selectedOrder?._id}?</p>
          <Form.Group className='mb-3'>
            <Form.Label>Reason for cancellation</Form.Label>
            <Form.Control
              as='textarea'
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder='Please provide a reason for cancellation...'
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant='secondary'
            onClick={() => {
              setShowCancelModal(false)
              setCancelReason('')
            }}
          >
            Close
          </Button>
          <Button variant='danger' onClick={handleCancelOrder}>
            Cancel Order
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  )
}

export default OrderHistoryScreen
