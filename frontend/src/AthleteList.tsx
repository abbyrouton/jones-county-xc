import { useQuery } from '@tanstack/react-query'

interface Athlete {
  id: number
  name: string
  grade: number
  personalRecord: string
  events: string
}

async function fetchAthletes(): Promise<Athlete[]> {
  const res = await fetch('/api/athletes')
  if (!res.ok) throw new Error('Failed to fetch athletes')
  return res.json()
}

function AthleteCard({ athlete }: { athlete: Athlete }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-800">{athlete.name}</h3>
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
          Grade {athlete.grade}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span className="text-yellow-600 font-bold">{athlete.personalRecord}</span>
        </div>
        {athlete.events && (
          <span className="text-sm text-gray-500">{athlete.events}</span>
        )}
      </div>
    </div>
  )
}

function groupByGrade(athletes: Athlete[]): Record<number, Athlete[]> {
  return athletes.reduce((groups, athlete) => {
    const grade = athlete.grade
    if (!groups[grade]) groups[grade] = []
    groups[grade].push(athlete)
    return groups
  }, {} as Record<number, Athlete[]>)
}

const gradeLabels: Record<number, string> = {
  9: 'Freshmen',
  10: 'Sophomores',
  11: 'Juniors',
  12: 'Seniors'
}

export default function AthleteList() {
  const { data: athletes, isLoading, error } = useQuery({
    queryKey: ['athletes'],
    queryFn: fetchAthletes,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500 text-center">Loading athletes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-red-500 text-center">Error: {error.message}</p>
      </div>
    )
  }

  const groupedAthletes = groupByGrade(athletes || [])
  const grades = [12, 11, 10, 9] // Seniors first

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-6">Our Athletes</h2>
      <div className="space-y-6">
        {grades.map((grade) => {
          const gradeAthletes = groupedAthletes[grade]
          if (!gradeAthletes || gradeAthletes.length === 0) return null

          return (
            <div key={grade}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span className="bg-green-800 text-white px-3 py-1 rounded-full text-sm">
                  {gradeLabels[grade]}
                </span>
                <span className="text-sm text-gray-400">({gradeAthletes.length} athletes)</span>
              </h3>
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
                {gradeAthletes.map((athlete) => (
                  <AthleteCard key={athlete.id} athlete={athlete} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
