import { useEffect, useState } from 'react'
import { FaTrash, FaCheck, FaTimes, FaEdit } from 'react-icons/fa'
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
    <div className='p-6 bg-gray-50 min-h-screen'>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <div className='flex flex-col md:flex-row md:justify-center'>
          <div className='w-full md:w-3/4 mx-auto bg-white rounded-lg shadow-lg overflow-hidden'>
            <h2 className='text-3xl font-bold text-gray-800 p-4 border-b'>
              Users
            </h2>
            <table className='w-full table-auto'>
              <thead className='bg-gray-100 text-gray-600'>
                <tr>
                  <th className='px-6 py-3 text-left'>ID</th>
                  <th className='px-6 py-3 text-left'>NAME</th>
                  <th className='px-6 py-3 text-left'>EMAIL</th>
                  <th className='px-6 py-3 text-left'>ADMIN</th>
                  <th className='px-6 py-3 text-left'>ACTIONS</th>
                </tr>
              </thead>
              <tbody className='text-gray-700'>
                {users.map((user) => {
                  const userState = editableFields[user._id] || {}

                  return (
                    <tr
                      key={user._id}
                      className='border-b hover:bg-gray-50 transition duration-200 ease-in-out'
                    >
                      <td className='px-6 py-4'>{user._id}</td>

                      {/* Username */}
                      <td className='px-6 py-4'>
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
                            className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
                          />
                        ) : (
                          user.username
                        )}
                      </td>

                      {/* Email */}
                      <td className='px-6 py-4'>
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
                            className='w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400'
                          />
                        ) : (
                          user.email
                        )}
                      </td>

                      {/* isAdmin (Not Editable) */}
                      <td className='px-6 py-4 text-center'>
                        {user.isAdmin ? 'Yes' : 'No'}
                      </td>

                      {/* Actions */}
                      <td className='px-6 py-4 text-center'>
                        {editingUserId === user._id ? (
                          <>
                            <button
                              onClick={() => handleUpdate(user)}
                              className='bg-green-600 hover:bg-green-700 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-150 mr-2'
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className='bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-400 transition duration-150'
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingUserId(user._id)}
                              className='bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-150 mr-2'
                            >
                              <FaEdit />
                            </button>
                            {!user.isAdmin && (
                              <button
                                onClick={() => deleteHandler(user._id)}
                                className='bg-red-600 hover:bg-red-700 text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400 transition duration-150'
                              >
                                <FaTrash />
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserList
