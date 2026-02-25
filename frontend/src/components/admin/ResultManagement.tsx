import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '../../lib/api';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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

export function ResultManagement() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
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

  if (isLoading) return <div>Loading results...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Results</h2>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)}>Add Result</Button>
        )}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Result' : 'Add New Result'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="athleteId">Athlete</Label>
                <Select
                  value={formData.athleteId}
                  onValueChange={(value) => setFormData({ ...formData, athleteId: value })}
                >
                  <SelectTrigger>
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
                  <SelectTrigger>
                    <SelectValue placeholder="Select meet" />
                  </SelectTrigger>
                  <SelectContent>
                    {meets.map((meet) => (
                      <SelectItem key={meet.id} value={meet.id.toString()}>
                        {meet.name} ({new Date(meet.date).toLocaleDateString()})
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
                  required
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
        {results.map((result) => (
          <Card key={result.id}>
            <CardContent className="flex justify-between items-center p-4">
              <div>
                <h3 className="font-bold">{result.athleteName}</h3>
                <p className="text-sm text-gray-600">
                  {result.meetName} | {new Date(result.meetDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Time: {result.time} | Place: {result.place}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(result)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(result.id)}
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
