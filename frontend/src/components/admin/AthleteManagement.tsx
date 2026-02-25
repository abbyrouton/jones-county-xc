import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

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

  if (isLoading) return <div>Loading athletes...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Athletes</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>Add Athlete</Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Athlete' : 'Add New Athlete'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  type="number"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="pr">Personal Record (optional)</Label>
                <Input
                  id="pr"
                  value={formData.personalRecord}
                  onChange={(e) => setFormData({ ...formData, personalRecord: e.target.value })}
                  placeholder="e.g., 16:30"
                />
              </div>
              <div>
                <Label htmlFor="events">Events (optional)</Label>
                <Input
                  id="events"
                  value={formData.events}
                  onChange={(e) => setFormData({ ...formData, events: e.target.value })}
                  placeholder="e.g., 5K, 3K"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {athletes.map((athlete) => (
          <Card key={athlete.id}>
            <CardContent className="flex justify-between items-center p-4">
              <div>
                <h3 className="font-bold">{athlete.name}</h3>
                <p className="text-sm text-gray-600">
                  Grade {athlete.grade}
                  {athlete.personalRecord && ` | PR: ${athlete.personalRecord}`}
                  {athlete.events && ` | ${athlete.events}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(athlete)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(athlete.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
