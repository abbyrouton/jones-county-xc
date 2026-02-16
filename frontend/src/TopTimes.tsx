import { useQuery } from '@tanstack/react-query'

interface TopTime {
  id: number
  time: string
  place: number
  athleteId: number
  athleteName: string
  meetId: number
  meetName: string
  meetDate: string
}

async function fetchTopTimes(): Promise<TopTime[]> {
  const res = await fetch('/api/top-times')
  if (!res.ok) throw new Error('Failed to fetch top times')
  return res.json()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function TopTimes() {
  const { data: topTimes, isLoading, error } = useQuery({
    queryKey: ['top-times'],
    queryFn: fetchTopTimes,
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6" role="status" aria-live="polite">
        <p className="text-gray-500 text-center">Loading top times...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6" role="alert">
        <p className="text-red-500 text-center">Error: {error.message}</p>
      </div>
    )
  }

  return (
    <section id="top-times" aria-labelledby="top-times-heading" className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 id="top-times-heading" className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">
        Top <span className="text-[#16a34a]">Times</span>
      </h2>

      {!topTimes || topTimes.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No times recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <caption className="sr-only">Top 10 fastest cross country times, showing rank, athlete name, time, meet name, and date</caption>
            <thead>
              <tr className="border-b border-gray-200">
                <th scope="col" className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Rank</th>
                <th scope="col" className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Athlete</th>
                <th scope="col" className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Time</th>
                <th scope="col" className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Meet</th>
                <th scope="col" className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {topTimes.map((time, index) => (
                <tr
                  key={time.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-yellow-50/50' : ''}`}
                >
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      index === 0 ? 'bg-yellow-400 text-yellow-900' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-semibold text-gray-900">{time.athleteName}</td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center gap-1 bg-[#16a34a]/10 text-[#16a34a] px-2 py-1 rounded font-bold text-sm">
                      {time.time}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-600">{time.meetName}</td>
                  <td className="py-3 px-2 text-gray-500 text-sm">{formatDate(time.meetDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
