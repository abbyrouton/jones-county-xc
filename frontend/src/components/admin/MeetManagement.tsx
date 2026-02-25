import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

interface Meet {
  id: number;
  name: string;
  date: string;
  location: string;
  description?: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function MeetManagement() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
  });

  const { data: meets = [], isLoading } = useQuery<Meet[]>({
    queryKey: ['meets'],
    queryFn: async () => {
      const response = await fetch('/api/meets');
      if (!response.ok) throw new Error('Failed to fetch meets');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchWithAuth('/api/meets', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create meet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meets'] });
      setSuccessMessage('Meet created successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetchWithAuth(`/api/meets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update meet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meets'] });
      setSuccessMessage('Meet updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(`/api/meets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete meet');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meets'] });
      setSuccessMessage('Meet deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
  });

  const resetForm = () => {
    setFormData({ name: '', date: '', location: '', description: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (meet: Meet) => {
    setFormData({
      name: meet.name,
      date: meet.date,
      location: meet.location,
      description: meet.description || '',
    });
    setEditingId(meet.id);
    setIsAdding(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <div className="flex justify-between items-center">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <div className="flex justify-between items-center">
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">Loading meets...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {successMessage && (
        <div className="fixed bottom-4 right-4 bg-[#16a34a] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in z-50" role="status" aria-live="polite">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMessage}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Manage Meets</h2>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white"
          >
            + Add Meet
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Meet' : 'Add New Meet'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Meet Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="focus:ring-[#16a34a] focus:border-[#16a34a]"
                required
              />
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="focus:ring-[#16a34a] focus:border-[#16a34a]"
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="focus:ring-[#16a34a] focus:border-[#16a34a]"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="focus:ring-[#16a34a] focus:border-[#16a34a]"
                rows={3}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="bg-[#16a34a] hover:bg-[#15803d] text-white"
              >
                {editingId ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-3">
        {meets.map((meet) => (
          <div key={meet.id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:border-[#16a34a]/30 hover:shadow-lg hover:bg-white transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{meet.name}</h3>
                  <span className="text-xs bg-[#16a34a] text-white px-3 py-1 rounded-full font-semibold flex items-center gap-1 shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(meet.date)}
                  </span>
                </div>
                <p className="text-sm text-[#16a34a] font-medium mb-2 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {meet.location}
                </p>
                {meet.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{meet.description}</p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(meet)}
                  className="border-[#16a34a]/30 text-[#16a34a] hover:bg-[#16a34a] hover:text-white"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm(`Delete ${meet.name}?`)) {
                      deleteMutation.mutate(meet.id);
                    }
                  }}
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
