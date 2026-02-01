import { useQuery } from '@tanstack/react-query'

interface Athlete {
  id: number
  name: string
  grade: number
  personalRecord: string
}

async function fetchAthletes(): Promise<Athlete[]> {
  const res = await fetch('/api/athletes')
  if (!res.ok) throw new Error('Failed to fetch athletes')
  return res.json()
}

export default function AthleteList() {
  const { data: athletes, isLoading, error } = useQuery({
    queryKey: ['athletes'],
    queryFn: fetchAthletes,
  })

  if (isLoading) return <p>Loading athletes...</p>
  if (error) return <p>Error: {error.message}</p>

  return (
    <ul>
      {athletes?.map((athlete) => (
        <li key={athlete.id}>
          {athlete.name} - Grade {athlete.grade} - PR: {athlete.personalRecord}
        </li>
      ))}
    </ul>
  )
}
