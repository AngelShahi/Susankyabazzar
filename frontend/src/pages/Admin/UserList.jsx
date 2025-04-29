import { useEffect, useState } from 'react'
import Message from '../../components/Message'
import Loader from '../../components/Loader'
import Modal from '../../components/Modal'
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  useNotifyUserStatusChangeMutation,
} from '../../redux/api/usersApiSlice'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../redux/features/auth/authSlice'

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery()
  const [deleteUser] = useDeleteUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const [notifyUserStatusChange] = useNotifyUserStatusChangeMutation()
  const currentUser = useSelector(selectCurrentUser)

  // State for deactivation modal
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [deactivationReason, setDeactivationReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    refetch()
  }, [refetch])

  const toggleUserStatus = async (user) => {
    if (user._id === currentUser._id) {
      toast.error('You cannot deactivate your own account')
      return
    }

    if (user.isActive) {
      // Show deactivation modal
      setSelectedUser(user)
      setShowDeactivateModal(true)
    } else {
      // Activate user immediately
      await handleStatusChange(user, true)
    }
  }

  const handleStatusChange = async (user, activate, reason = '') => {
    setIsProcessing(true)
    try {
      const updatedUser = {
        userId: user._id,
        isActive: activate,
        deactivationReason: reason,
      }

      // First update the user status
      await updateUser(updatedUser).unwrap()

      // Then send notification
      try {
        await notifyUserStatusChange({
          email: user.email,
          username: user.username,
          isActive: activate,
          reason,
        }).unwrap()
        toast.success(`Notification sent to ${user.email}`)
      } catch (emailError) {
        console.error('Email notification failed:', emailError)
        toast.warning('User status updated but notification failed')
      }

      toast.success(
        `User ${activate ? 'activated' : 'deactivated'} successfully`
      )
      refetch()
    } catch (err) {
      console.error('Status change error:', err)
      toast.error(err?.data?.message || err.error || 'Operation failed')
    } finally {
      setIsProcessing(false)
      setShowDeactivateModal(false)
      setDeactivationReason('')
    }
  }

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id)
        toast.success('User deleted successfully')
        refetch()
      } catch (err) {
        toast.error(err?.data?.message || err.error)
      }
    }
  }

  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] text-gray-100 py-8 px-4'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-3xl font-bold mb-6 text-[rgb(211,190,249)]'>
          User Management
        </h1>

        {/* Deactivation Modal */}
        <Modal
          isOpen={showDeactivateModal}
          onClose={() => {
            setShowDeactivateModal(false)
            setDeactivationReason('')
          }}
          title='Deactivate User'
        >
          <div className='space-y-4'>
            <p>Are you sure you want to deactivate {selectedUser?.username}?</p>
            <div>
              <label
                htmlFor='reason'
                className='block text-sm font-medium mb-1'
              >
                Reason for deactivation (optional):
              </label>
              <textarea
                id='reason'
                rows={3}
                className='w-full p-2 bg-gray-800 border border-gray-700 rounded-md text-white'
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                placeholder='Enter reason for deactivation...'
              />
            </div>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => {
                  setShowDeactivateModal(false)
                  setDeactivationReason('')
                }}
                className='px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700'
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleStatusChange(selectedUser, false, deactivationReason)
                }
                disabled={isProcessing}
                className='px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50'
              >
                {isProcessing ? 'Processing...' : 'Confirm Deactivation'}
              </button>
            </div>
          </div>
        </Modal>

        {isLoading ? (
          <div className='flex justify-center my-12'>
            <Loader />
          </div>
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <div className='bg-gray-900 bg-opacity-50 rounded-lg shadow-lg overflow-hidden border border-gray-800'>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-full divide-y divide-gray-800'>
                <thead className='bg-gray-800 text-gray-300'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      ID
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      Name
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      Email
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider'>
                      Admin
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-800 bg-gray-900 bg-opacity-40'>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className={`transition-colors duration-200 hover:bg-gray-800 hover:bg-opacity-70 ${
                        !user.isActive ? 'opacity-70' : ''
                      }`}
                    >
                      <td className='px-6 py-4 text-sm font-mono text-gray-400'>
                        {user._id.substring(0, 10)}...
                      </td>

                      <td className='px-6 py-4 text-sm'>{user.username}</td>

                      <td className='px-6 py-4 text-sm'>{user.email}</td>

                      <td className='px-6 py-4 text-sm'>
                        {user.isActive ? (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-green-600 text-white'>
                            Active
                          </span>
                        ) : (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-red-600 text-white'>
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className='px-6 py-4 text-sm'>
                        {user.isAdmin ? (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-[rgba(211,190,249,0.2)] text-[rgb(211,190,249)]'>
                            Admin
                          </span>
                        ) : (
                          <span className='px-2 py-1 text-xs font-medium rounded-full bg-gray-800 text-gray-400'>
                            User
                          </span>
                        )}
                      </td>

                      <td className='px-6 py-4 text-right'>
                        <div className='flex justify-end space-x-2'>
                          <button
                            onClick={() => toggleUserStatus(user)}
                            disabled={
                              isProcessing || user._id === currentUser._id
                            }
                            className={`p-2 rounded-md focus:outline-none focus:ring-2 transition duration-150 font-medium text-sm ${
                              user.isActive
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            } ${
                              isProcessing || user._id === currentUser._id
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            {user.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          {!user.isAdmin && (
                            <button
                              onClick={() => deleteHandler(user._id)}
                              disabled={
                                isProcessing || user._id === currentUser._id
                              }
                              className='bg-red-600 hover:bg-red-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-150 font-medium text-sm disabled:opacity-50'
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users && users.length === 0 && (
                <div className='text-center py-8 text-gray-400'>
                  No users found.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserList
