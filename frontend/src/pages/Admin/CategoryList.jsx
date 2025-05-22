import { useState } from 'react'
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} from '../../redux/api/categoryApiSlice'
import { toast } from 'react-toastify'
import CategoryForm from '../../components/CategoryForm'
import Modal from '../../components/Modal'

const CategoryList = () => {
  const { data: categories, isLoading, refetch } = useFetchCategoriesQuery()
  const [name, setName] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [updatingName, setUpdatingName] = useState('')
  const [modalVisible, setModalVisible] = useState(false)

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation()
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation()

  const handleCreateCategory = async (e) => {
    e.preventDefault()

    if (!name) {
      toast.error('Category name is required')
      return
    }

    try {
      const result = await createCategory({ name }).unwrap()
      if (result.error) {
        toast.error(result.error)
      } else {
        setName('')
        toast.success(`${result.name} is created.`)
        // Refetch categories to update the list immediately
        refetch()
      }
    } catch (error) {
      console.error(error)
      toast.error('Creating category failed, try again.')
    }
  }

  const handleUpdateCategory = async (e) => {
    e.preventDefault()

    if (!updatingName) {
      toast.error('Category name is required')
      return
    }

    try {
      const result = await updateCategory({
        categoryId: selectedCategory._id,
        updatedCategory: { name: updatingName },
      }).unwrap()

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${result.name} is updated`)
        setSelectedCategory(null)
        setUpdatingName('')
        setModalVisible(false)
        // Refetch categories to update the list immediately
        refetch()
      }
    } catch (error) {
      console.error(error)
      toast.error('Category update failed. Try again.')
    }
  }

  const handleDeleteCategory = async () => {
    try {
      const result = await deleteCategory(selectedCategory._id).unwrap()

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`${result.name} is deleted.`)
        setSelectedCategory(null)
        setModalVisible(false)
        // Refetch categories to update the list immediately
        refetch()
      }
    } catch (error) {
      console.error(error)
      toast.error('Category deletion failed. Try again.')
    }
  }

  return (
    <div className='min-h-screen bg-[rgb(7,10,19)] text-gray-100'>
      <div className='max-w-6xl mx-auto p-6'>
        <div className='mb-8 border-b border-gray-800 pb-4'>
          <h1 className='text-3xl font-bold text-[rgb(211,190,249)]'>
            Manage Categories
          </h1>
          <p className='text-gray-400 mt-2'>
            Create, update, and organize your content categories
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-1'>
            <div className='bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg border border-gray-800'>
              <h2 className='text-xl font-semibold mb-4 text-[rgb(211,190,249)]'>
                Add New Category
              </h2>
              <CategoryForm
                value={name}
                setValue={setName}
                handleSubmit={handleCreateCategory}
                buttonText={isCreating ? 'Creating...' : 'Create Category'}
                buttonClassName={`w-full font-medium py-2 px-4 rounded-md transition-colors duration-200 ${
                  isCreating
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-[rgb(211,190,249)] hover:bg-[rgb(191,170,229)] text-gray-900'
                }`}
                disabled={isCreating}
              />
            </div>
          </div>

          <div className='lg:col-span-2'>
            <div className='bg-gray-900 bg-opacity-50 rounded-lg p-6 shadow-lg border border-gray-800'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-semibold text-[rgb(211,190,249)]'>
                  Current Categories
                </h2>
                {isLoading && (
                  <div className='text-sm text-gray-400'>Loading...</div>
                )}
              </div>

              {categories && categories.length > 0 ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className='bg-gray-800 bg-opacity-60 rounded-lg p-3 border border-gray-700 hover:border-[rgb(211,190,249)] transition-all duration-200'
                    >
                      <div className='flex justify-between items-center'>
                        <span className='font-medium'>{category.name}</span>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => {
                              setModalVisible(true)
                              setSelectedCategory(category)
                              setUpdatingName(category.name)
                            }}
                            className='text-[rgb(211,190,249)] hover:text-white transition-colors text-sm font-medium'
                            title='Edit Category'
                            disabled={isUpdating || isDeleting}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : isLoading ? (
                <div className='text-center py-8 text-gray-400'>
                  Loading categories...
                </div>
              ) : (
                <div className='text-center py-8 text-gray-400'>
                  No categories found. Create your first category!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
        <div className='bg-gray-900 p-6 rounded-lg border border-gray-800'>
          <h3 className='text-xl font-semibold mb-4 text-[rgb(211,190,249)]'>
            {selectedCategory ? 'Update Category' : 'Edit Category'}
          </h3>
          <CategoryForm
            value={updatingName}
            setValue={(value) => setUpdatingName(value)}
            handleSubmit={handleUpdateCategory}
            buttonText={isUpdating ? 'Updating...' : 'Update'}
            buttonClassName={`font-medium py-2 px-4 rounded-md transition-colors duration-200 ${
              isUpdating
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-[rgb(211,190,249)] hover:bg-[rgb(191,170,229)] text-gray-900'
            }`}
            disabled={isUpdating}
          />
          {selectedCategory && (
            <div className='mt-4 pt-4 border-t border-gray-800'>
              <button
                onClick={handleDeleteCategory}
                disabled={isDeleting || isUpdating}
                className={`flex items-center justify-center w-full mt-2 py-2 px-4 rounded-md transition-colors duration-200 ${
                  isDeleting || isUpdating
                    ? 'text-gray-500 bg-gray-800 cursor-not-allowed'
                    : 'text-red-400 hover:text-white hover:bg-red-600'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete this category'}
              </button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default CategoryList
