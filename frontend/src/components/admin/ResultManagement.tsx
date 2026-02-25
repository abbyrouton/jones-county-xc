import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface Result {
  id: number;
  athleteId: number;
  athleteName: string;
  athleteGrade: number;
  meetId: number;
  meetName: string;
  meetDate: string;
  time: string;
  place: number;
}

interface Athlete {
  id: number;
  name: string;
  grade: number;
}

interface Meet {
  id: number;
  name: string;
  date: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function ResultManagement() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    athleteId: '',
    meetId: '',
    time: '',
    place: '',
  });

  const { data: results = [], isLoading } = useQuery<Result[]>({
    queryKey: ['results'],
    queryFn: async () => {
      const response = await fetch('/api/results');
      if (!response.ok) throw new Error('Failed to fetch results');
      return response.json();
    },
  });

  const { data: athletes = [] } = useQuery<Athlete[]>({
    queryKey: ['athletes'],
    queryFn: async () => {
      const response = await fetch('/api/athletes');
      if (!response.ok) throw new Error('Failed to fetch athletes');
      return response.json();
    },
  });

  const { data: meets = [] } = useQuery<Meet[]>({
    queryKey: ['meets'],
    queryFn: async () => {
      const response = await fetch('/api/meets');
      if (!response.ok) throw new Error('Failed to fetch meets');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetchWithAuth('/api/results', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create result');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      setSuccessMessage('Result created successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetchWithAuth(`/api/results/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update result');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      setSuccessMessage('Result updated successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetchWithAuth(`/api/results/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete result');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      setSuccessMessage('Result deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 4000);
    },
  });

  const resetForm = () => {
    setFormData({ athleteId: '', meetId: '', time: '', place: '' });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      athleteId: parseInt(formData.athleteId),
      meetId: parseInt(formData.meetId),
      time: formData.time,
      place: parseInt(formData.place),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (result: Result) => {
    setFormData({
      athleteId: result.athleteId.toString(),
      meetId: result.meetId.toString(),
      time: result.time,
      place: result.place.toString(),
    });
    setEditingId(result.id);
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
        <span className="sr-only">Loading results...</span>
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
        <h2 className="text-xl font-bold text-gray-900">Manage Results</h2>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            className="bg-[#16a34a] hover:bg-[#15803d] text-white"
          >
            + Add Result
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Edit Result' : 'Add New Result'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="athleteId">Athlete</Label>
              <Select
                value={formData.athleteId}
                onValueChange={(value) => setFormData({ ...formData, athleteId: value })}
              >
                <SelectTrigger className="focus:ring-[#16a34a] focus:border-[#16a34a]">
                  <SelectValue placeholder="Select athlete" />
                </SelectTrigger>
                <SelectContent>
                  {athletes.map((athlete) => (
                    <SelectItem key={athlete.id} value={athlete.id.toString()}>
                      {athlete.name} (Grade {athlete.grade})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="meetId">Meet</Label>
              <Select
                value={formData.meetId}
                onValueChange={(value) => setFormData({ ...formData, meetId: value })}
              >
                <SelectTrigger className="focus:ring-[#16a34a] focus:border-[#16a34a]">
                  <SelectValue placeholder="Select meet" />
                </SelectTrigger>
                <SelectContent>
                  {meets.map((meet) => (
                    <SelectItem key={meet.id} value={meet.id.toString()}>
                      {meet.name} ({formatDate(meet.date)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="focus:ring-[#16a34a] focus:border-[#16a34a]"
                placeholder="e.g., 16:30.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="place">Place</Label>
              <Input
                id="place"
                type="number"
                value={formData.place}
                onChange={(e) => setFormData({ ...formData, place: e.target.value })}
                className="focus:ring-[#16a34a] focus:border-[#16a34a]"
                required
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
        {results.map((result) => (
          <div key={result.id} className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:border-[#16a34a]/30 hover:shadow-lg hover:bg-white transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg text-gray-900 mb-1">{result.athleteName}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {result.meetName} • {formatDate(result.meetDate)}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                    </svg>
                    <span className="text-yellow-700 font-bold">{result.time}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {result.place === 1 && '🥇'}
                    {result.place === 2 && '🥈'}
                    {result.place === 3 && '🥉'}
                    {result.place > 3 && `#${result.place}`}
                    {result.place <= 3 && ` Place ${result.place}`}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(result)}
                  className="border-[#16a34a]/30 text-[#16a34a] hover:bg-[#16a34a] hover:text-white"
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm('Delete this result?')) {
                      deleteMutation.mutate(result.id);
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
