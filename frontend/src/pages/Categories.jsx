import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/UI/Card';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../utils/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const selectedColor = watch('color');

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#6B7280', '#F97316', '#06B6D4', '#84CC16'
  ];

  const icons = [
    '🍽️', '🚗', '🛍️', '🎬', '⚡', '🏥', '📚', '✈️',
    '💰', '📈', '💵', '💸', '🏠', '📱', '🎮', '☕',
    '👕', '🧪', '🎨', '🔧', '📦', '🎁', '📊', '💼'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, data);
        toast.success('Category updated successfully!');
      } else {
        await api.post('/categories', data);
        toast.success('Category created successfully!');
      }
      
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      const message = error.response?.data?.message || 'Operation failed';
      toast.error(message);
    }
  };

  const handleEdit = (category) => {
    if (!category.isCustom) {
      toast.error('Default categories cannot be edited');
      return;
    }
    
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('icon', category.icon);
    setValue('color', category.color);
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    if (!category.isCustom) {
      toast.error('Default categories cannot be deleted');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${category._id}`);
        toast.success('Category deleted successfully!');
        fetchCategories();
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete category';
        toast.error(message);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    reset({
      name: '',
      icon: '📁',
      color: '#3B82F6'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const defaultCategories = categories.filter(cat => !cat.isCustom);
  const customCategories = categories.filter(cat => cat.isCustom);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Default Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Default Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {defaultCategories.map((category) => (
              <div
                key={category._id}
                className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </div>
                  <span className="font-medium text-gray-900">{category.name}</span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                  Default
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Custom Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {customCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {customCategories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg"
                      style={{ backgroundColor: category.color }}
                    >
                      {category.icon}
                    </div>
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => handleEdit(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={() => handleDelete(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No custom categories</p>
              <p className="text-gray-400">Create your first custom category</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <Button variant="outline" size="small" onClick={handleCloseModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <Input
                label="Category Name"
                placeholder="Enter category name"
                error={errors.name?.message}
                {...register('name', { 
                  required: 'Category name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
              />

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon
                </label>
                <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto border rounded-lg p-4">
                  {icons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      className={`p-2 rounded-lg border-2 text-xl hover:bg-gray-100 transition-colors ${
                        watch('icon') === icon ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                      onClick={() => setValue('icon', icon)}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input type="hidden" {...register('icon', { required: 'Please select an icon' })} />
                {errors.icon && (
                  <p className="text-sm text-red-600 mt-1">{errors.icon.message}</p>
                )}
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-12 h-12 rounded-lg border-4 transition-all ${
                        selectedColor === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setValue('color', color)}
                    />
                  ))}
                </div>
                <input type="hidden" {...register('color', { required: 'Please select a color' })} />
                {errors.color && (
                  <p className="text-sm text-red-600 mt-1">{errors.color.message}</p>
                )}
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: selectedColor || '#3B82F6' }}
                  >
                    {watch('icon') || '📁'}
                  </div>
                  <span className="font-medium text-gray-900">
                    {watch('name') || 'Category Name'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCategory ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
