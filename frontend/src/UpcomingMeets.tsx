// TODO: Replace placeholder data with useQuery fetch from /api/meets
interface Meet {
  id: number
  name: string
  date: string
  location: string
  description: string
}

const placeholderMeets: Meet[] = [
  {
    id: 1,
    name: 'Panther Creek Invitational',
    date: '2026-08-22',
    location: 'Panther Creek State Park, Covington, GA',
    description: 'Season opener on a fast, flat course through the state park. Great opportunity for early-season PRs. JV races start at 8:00 AM, Varsity at 9:30 AM.'
  },
  {
    id: 2,
    name: 'Run the Bison Classic',
    date: '2026-09-05',
    location: 'Berkmar High School, Lilburn, GA',
    description: 'One of the largest invitationals in Georgia with 30+ schools competing. Challenging hills in the second mile. Championship and Open divisions available.'
  },
  {
    id: 3,
    name: 'Grayson Invitational',
    date: '2026-09-12',
    location: 'Grayson High School, Loganville, GA',
    description: 'Competitive meet featuring top metro Atlanta programs. Fast course with a steep downhill finish. Elite runners target sub-16 times here.'
  },
  {
    id: 4,
    name: 'Region 4-AAAAA Championship',
    date: '2026-10-17',
    location: 'Jones County Recreation Complex, Gray, GA',
    description: 'Home course advantage! Top 8 teams and top 20 individuals advance to State. Course features rolling hills and a signature creek crossing.'
  }
]

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

export default function UpcomingMeets() {
  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-green-800 mb-4">Upcoming Meets</h2>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {placeholderMeets.map((meet) => (
          <button
            key={meet.id}
            className="text-left bg-white rounded-xl shadow-md hover:shadow-lg p-4 sm:p-5 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer border border-gray-100"
            onClick={() => alert(`View details for ${meet.name}`)}
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <h3 className="font-bold text-green-800 text-base sm:text-lg">{meet.name}</h3>
              <span className="text-xs bg-yellow-400 text-green-900 px-2 py-1 rounded-full font-semibold flex items-center gap-1 w-fit shrink-0 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(meet.date)}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-green-600 font-medium mb-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {meet.location}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3 sm:line-clamp-none">{meet.description}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
