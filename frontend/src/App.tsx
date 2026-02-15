import AthleteList from './AthleteList'
import TodayDate from './TodayDate'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Welcome Banner */}
      <div className="bg-green-800 text-white py-8 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2 text-yellow-400">
            Welcome to Jones County Cross Country
          </h1>
          <p className="text-xl text-green-100">
            Home of the Greyhounds
          </p>
          <TodayDate />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <AthleteList />
      </div>
    </div>
  )
}

export default App
