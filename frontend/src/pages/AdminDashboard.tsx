import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { AthleteManagement } from '../components/admin/AthleteManagement';
import { MeetManagement } from '../components/admin/MeetManagement';
import { ResultManagement } from '../components/admin/ResultManagement';

export function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Jones County XC Management</CardTitle>
          <CardDescription>Manage athletes, meets, and results</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="athletes" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="athletes">Athletes</TabsTrigger>
              <TabsTrigger value="meets">Meets</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>
            <TabsContent value="athletes">
              <AthleteManagement />
            </TabsContent>
            <TabsContent value="meets">
              <MeetManagement />
            </TabsContent>
            <TabsContent value="results">
              <ResultManagement />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
