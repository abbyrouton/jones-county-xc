import AthleteList from './AthleteList'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Jones County XC
        </h1>
        <AthleteList />
      </div>
    </div>
  )
}

export default App
