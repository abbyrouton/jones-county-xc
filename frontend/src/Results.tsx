import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Meet {
  id: number
  name: string
  date: string
  location: string
  description: string
}

interface MeetResult {
  id: number
  time: string
  place: number
  athleteId: number
  athleteName: string
  athleteGrade: number
}

async function fetchMeets(): Promise<Meet[]> {
  const res = await fetch('/api/meets')
  if (!res.ok) throw new Error('Failed to fetch meets')
  return res.json()
}

async function fetchMeetResults(meetId: number): Promise<MeetResult[]> {
  const res = await fetch(`/api/meets/${meetId}/results`)
  if (!res.ok) throw new Error('Failed to fetch results')
  return res.json()
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function Results() {
  const [selectedMeetId, setSelectedMeetId] = useState<string>('')

  const { data: meets, isLoading: meetsLoading } = useQuery({
    queryKey: ['meets'],
    queryFn: fetchMeets,
  })

  const { data: results, isLoading: resultsLoading } = useQuery({
    queryKey: ['meet-results', selectedMeetId],
    queryFn: () => fetchMeetResults(Number(selectedMeetId)),
    enabled: !!selectedMeetId,
  })

  const selectedMeet = meets?.find(m => m.id === Number(selectedMeetId))

  if (meetsLoading) {
    return (
      <section className="bg-white rounded-2xl shadow-lg p-6 sm:p-8" role="status" aria-live="polite" aria-label="Loading meets">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="h-9 w-48 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="h-20 w-full bg-gray-100 rounded-lg animate-pulse" />
        <span className="sr-only">Loading meets...</span>
      </section>
    )
  }

  return (
    <section id="results" aria-labelledby="results-heading" className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 id="results-heading" className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
          Meet <span className="text-[#16a34a]">Results</span>
        </h2>

        <div className="flex flex-col gap-1">
          <label htmlFor="meet-select" className="sr-only">Select a meet</label>
          <Select value={selectedMeetId} onValueChange={setSelectedMeetId}>
            <SelectTrigger id="meet-select" className="w-full sm:w-64" aria-label="Select a meet to view results">
              <SelectValue placeholder="Select a meet" />
            </SelectTrigger>
            <SelectContent>
              {meets?.map((meet) => (
                <SelectItem key={meet.id} value={String(meet.id)}>
                  {meet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedMeetId ? (
        <p className="text-gray-500 text-center py-8">Select a meet to view results.</p>
      ) : resultsLoading ? (
        <div role="status" aria-live="polite" aria-label="Loading results">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="text-left py-3 px-2"><div className="h-4 w-16 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="text-left py-3 px-2"><div className="h-4 w-14 bg-gray-200 rounded animate-pulse" /></th>
                  <th className="text-left py-3 px-2"><div className="h-4 w-12 bg-gray-200 rounded animate-pulse" /></th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((row) => (
                  <tr key={row} className="border-b border-gray-100">
                    <td className="py-3 px-2"><div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" /></td>
                    <td className="py-3 px-2"><div className="h-5 w-28 bg-gray-200 rounded animate-pulse" /></td>
                    <td className="py-3 px-2"><div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" /></td>
                    <td className="py-3 px-2"><div className="h-6 w-14 bg-gray-200 rounded animate-pulse" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <span className="sr-only">Loading results...</span>
        </div>
      ) : !results || results.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No results recorded for this meet.</p>
      ) : (
        <div>
          {selectedMeet && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{selectedMeet.location}</span>
                {' '}&bull;{' '}
                <time dateTime={selectedMeet.date}>{formatDate(selectedMeet.date)}</time>
              </p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <caption className="sr-only">Meet results showing place, athlete name, grade, and finishing time</caption>
              <thead>
                <tr className="border-b border-gray-200">
                  <th scope="col" className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Place</th>
                  <th scope="col" className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Athlete</th>
                  <th scope="col" className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Grade</th>
                  <th scope="col" className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Time</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr
                    key={result.id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${result.place <= 3 ? 'bg-yellow-50/50' : ''}`}
                  >
                    <td className="py-3 px-2">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                        result.place === 1 ? 'bg-yellow-400 text-yellow-900' :
                        result.place === 2 ? 'bg-gray-300 text-gray-700' :
                        result.place === 3 ? 'bg-amber-600 text-white' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {result.place}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-semibold text-gray-900">{result.athleteName}</td>
                    <td className="py-3 px-2">
                      <span className="text-xs bg-[#16a34a]/10 text-[#16a34a] px-2 py-1 rounded-full font-semibold">
                        Grade {result.athleteGrade}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <span className="inline-flex items-center gap-1 bg-[#16a34a]/10 text-[#16a34a] px-2 py-1 rounded font-bold text-sm">
                        {result.time}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
