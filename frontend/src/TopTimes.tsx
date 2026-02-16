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
  const { data: topTimes, isLoading, error, refetch } = useQuery({
    queryKey: ['top-times'],
    queryFn: fetchTopTimes,
  })

  if (isLoading) {
    return (
      <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8" role="status" aria-live="polite" aria-label="Loading top times">
        <div className="h-9 w-40 bg-gray-200 rounded-lg animate-pulse mb-6" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></th>
                <th className="text-left py-3 px-2"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                <th className="text-left py-3 px-2"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></th>
                <th className="text-left py-3 px-2"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></th>
                <th className="text-left py-3 px-2"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((row) => (
                <tr key={row} className="border-b border-gray-100">
                  <td className="py-3 px-2"><div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" /></td>
                  <td className="py-3 px-2"><div className="h-5 w-28 bg-gray-200 rounded animate-pulse" /></td>
                  <td className="py-3 px-2"><div className="h-6 w-14 bg-gray-200 rounded animate-pulse" /></td>
                  <td className="py-3 px-2"><div className="h-5 w-24 bg-gray-200 rounded animate-pulse" /></td>
                  <td className="py-3 px-2"><div className="h-5 w-20 bg-gray-200 rounded animate-pulse" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <span className="sr-only">Loading top times...</span>
      </section>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center" role="alert">
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-semibold">Failed to load top times</p>
          <p className="text-sm text-gray-500 mt-1">{error.message}</p>
        </div>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-[#16a34a] text-white rounded-lg font-semibold hover:bg-[#15803d] transition-colors focus:ring-2 focus:ring-[#16a34a] focus:ring-offset-2 focus:outline-none"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <section id="top-times" aria-labelledby="top-times-heading" className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 animate-fade-in">
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
                  className={`border-b border-gray-100 hover:bg-gray-50 transition-colors animate-fade-in-row ${index < 3 ? 'bg-yellow-50/50' : ''}`}
                  style={{ animationDelay: `${index * 50}ms` }}
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
