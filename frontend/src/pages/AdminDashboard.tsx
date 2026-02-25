import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
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
    <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Admin <span className="text-[#16a34a]">Dashboard</span>
            </h1>
            <p className="text-gray-600 mt-1">Manage athletes, meets, and results</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Logout
          </Button>
        </div>

        <Tabs defaultValue="athletes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="athletes">Athletes</TabsTrigger>
            <TabsTrigger value="meets">Meets</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          <TabsContent value="athletes" className="space-y-4">
            <AthleteManagement />
          </TabsContent>
          <TabsContent value="meets" className="space-y-4">
            <MeetManagement />
          </TabsContent>
          <TabsContent value="results" className="space-y-4">
            <ResultManagement />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
