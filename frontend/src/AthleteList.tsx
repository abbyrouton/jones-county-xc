import { useState, useEffect } from 'react'

interface Athlete {
  name: string
  grade: number
  personalRecord: string
}

export default function AthleteList() {
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/athletes')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch athletes')
        return res.json()
      })
      .then(data => {
        setAthletes(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Loading athletes...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <ul>
      {athletes.map((athlete, index) => (
        <li key={index}>
          {athlete.name} - Grade {athlete.grade} - PR: {athlete.personalRecord}
        </li>
      ))}
    </ul>
  )
}
