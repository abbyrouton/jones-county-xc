import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface Athlete {
  id: number;
  name: string;
  grade: number;
  personalRecord?: string;
  events?: string;
}

export function AthleteManagement() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    personalRecord: '',
    events: '',
  });

  const { data: athletes = [], isLoading } = useQuery<Athlete[]>({
    queryKey: ['athletes'],
    queryFn: async () => {
      const response = await fetch('/api/athletes');
      if (!response.ok) throw new Error('Failed to fetch athletes');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchWithAuth('/api/athletes', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create athlete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      setSuccessMessage('Athlete created successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetchWithAuth(`/api/athletes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update athlete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      setSuccessMessage('Athlete updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(`/api/athletes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete athlete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      setSuccessMessage('Athlete deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
  });

  const resetForm = () => {
    setFormData({ name: '', grade: '', personalRecord: '', events: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      grade: parseInt(formData.grade),
      personalRecord: formData.personalRecord || '',
      events: formData.events || '',
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (athlete: Athlete) => {
    setFormData({
      name: athlete.name,
      grade: athlete.grade.toString(),
      personalRecord: athlete.personalRecord || '',
      events: athlete.events || '',
    });
    setEditingId(athlete.id);
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
                  <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-60 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <span className="sr-only">Loading athletes...</span>
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
        <h2 className="text-xl font-bold text-gray-900">Manage Athletes</h2>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white"
          >
            + Add Athlete
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Athlete' : 'Add New Athlete'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="focus:ring-[#16a34a] focus:border-[#16a34a]"
                required
              />
            </div>
            <div>
              <Label htmlFor="grade">Grade</Label>
              <select
                id="grade"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#16a34a] focus:border-[#16a34a] outline-none"
                required
              >
                <option value="">Select grade</option>
                <option value="9">9th Grade (Freshman)</option>
                <option value="10">10th Grade (Sophomore)</option>
                <option value="11">11th Grade (Junior)</option>
                <option value="12">12th Grade (Senior)</option>
              </select>
            </div>
            <div>
              <Label htmlFor="pr">Personal Record (optional)</Label>
              <Input
                id="pr"
                value={formData.personalRecord}
                onChange={(e) => setFormData({ ...formData, personalRecord: e.target.value })}
                className="focus:ring-[#16a34a] focus:border-[#16a34a]"
                placeholder="e.g., 16:30"
              />
            </div>
            <div>
              <Label htmlFor="events">Events (optional)</Label>
              <Input
                id="events"
                value={formData.events}
                onChange={(e) => setFormData({ ...formData, events: e.target.value })}
                className="focus:ring-[#16a34a] focus:border-[#16a34a]"
                placeholder="e.g., 5K, 3K"
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
        {athletes.map((athlete) => (
          <div key={athlete.id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:border-[#16a34a]/30 hover:shadow-lg hover:bg-white transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg text-gray-900">{athlete.name}</h3>
                  <span className="text-xs bg-[#16a34a]/10 text-[#16a34a] px-2 py-1 rounded-full font-semibold">
                    Grade {athlete.grade}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {athlete.personalRecord && (
                    <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                      </svg>
                      <span className="text-yellow-700 font-bold">{athlete.personalRecord}</span>
                    </div>
                  )}
                  {athlete.events && (
                    <span className="font-medium">{athlete.events}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(athlete)}
                  className="border-[#16a34a]/30 text-[#16a34a] hover:bg-[#16a34a] hover:text-white"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm(`Delete ${athlete.name}?`)) {
                      deleteMutation.mutate(athlete.id);
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
