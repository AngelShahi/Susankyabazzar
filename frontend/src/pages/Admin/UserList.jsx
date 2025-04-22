import { useEffect, useState } from 'react'
import Message from '../../components/Message'
import Loader from '../../components/Loader'
import {
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
} from '../../redux/api/usersApiSlice'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../redux/features/auth/authSlice'

const UserList = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery()
  const [deleteUser] = useDeleteUserMutation()
  const [updateUser] = useUpdateUserMutation()
  const currentUser = useSelector(selectCurrentUser)

  const [editableFields, setEditableFields] = useState({})
  const [editingUserId, setEditingUserId] = useState(null)

  useEffect(() => {
    refetch()
  }, [refetch])

  const handleInputChange = (userId, field, value) => {
    setEditableFields((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
      },
    }))
  }

  const handleUpdate = async (user) => {
    const updatedData = editableFields[user._id] || {}

    const updatedUser = {
      userId: user._id,
      username: updatedData.username ?? user.username,
      email: updatedData.email ?? user.email,
      isAdmin: user.isAdmin, // Admin field remains unchanged
    }

    if (
      currentUser._id === user._id &&
      user.isAdmin === true &&
      updatedUser.isAdmin === false
    ) {
      toast.error("You can't demote yourself from Admin!")
      return
    }

    try {
      await updateUser(updatedUser)
      toast.success('User updated')
      setEditingUserId(null)
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || err.error)
    }
  }

  const handleCancelEdit = () => {
    setEditingUserId(null)
  }

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure')) {
      try {
        await deleteUser(id)
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
                      Admin
                    </th>
                    <th className='px-6 py-3 text-right text-xs font-medium uppercase tracking-wider'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-800 bg-gray-900 bg-opacity-40'>
                  {users.map((user) => {
                    const userState = editableFields[user._id] || {}

                    return (
                      <tr
                        key={user._id}
                        className={`transition-colors duration-200 hover:bg-gray-800 hover:bg-opacity-70`}
                      >
                        <td className='px-6 py-4 text-sm font-mono text-gray-400'>
                          {user._id.substring(0, 10)}...
                        </td>

                        {/* Username */}
                        <td className='px-6 py-4 text-sm'>
                          {editingUserId === user._id ? (
                            <input
                              type='text'
                              value={userState.username ?? user.username}
                              onChange={(e) =>
                                handleInputChange(
                                  user._id,
                                  'username',
                                  e.target.value
                                )
                              }
                              className='w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)] text-white'
                            />
                          ) : (
                            user.username
                          )}
                        </td>

                        {/* Email */}
                        <td className='px-6 py-4 text-sm'>
                          {editingUserId === user._id ? (
                            <input
                              type='email'
                              value={userState.email ?? user.email}
                              onChange={(e) =>
                                handleInputChange(
                                  user._id,
                                  'email',
                                  e.target.value
                                )
                              }
                              className='w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)] text-white'
                            />
                          ) : (
                            user.email
                          )}
                        </td>

                        {/* isAdmin (Not Editable) */}
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

                        {/* Actions */}
                        <td className='px-6 py-4 text-right'>
                          {editingUserId === user._id ? (
                            <div className='flex justify-end space-x-2'>
                              <button
                                onClick={() => handleUpdate(user)}
                                className='bg-green-600 hover:bg-green-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-150'
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className='bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150'
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className='flex justify-end space-x-2'>
                              <button
                                onClick={() => setEditingUserId(user._id)}
                                className='bg-[rgb(211,190,249)] text-gray-900 hover:bg-[rgb(191,170,229)] p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(211,190,249)] transition duration-150 font-medium text-sm'
                              >
                                Edit
                              </button>
                              {!user.isAdmin && (
                                <button
                                  onClick={() => deleteHandler(user._id)}
                                  className='bg-red-600 hover:bg-red-700 text-white p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-150 font-medium text-sm'
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
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
