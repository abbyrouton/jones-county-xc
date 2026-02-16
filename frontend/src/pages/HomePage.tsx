import TodayDate from '../TodayDate'
import UpcomingMeets from '../UpcomingMeets'

export default function HomePage() {
  return (
    <>
      {/* Hero Banner */}
      <header className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-[#16a34a] via-[#15803d] to-[#0f172a] text-white py-20 px-4 overflow-hidden" role="banner">
        {/* Animated background elements - respects reduced motion preference */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-yellow-400/20 rounded-full blur-3xl motion-safe:animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-green-300/20 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzAgMzBtLTEgMGExIDEgMCAxIDAgMiAwYTEgMSAwIDEgMCAtMiAwIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz48L2c+PC9zdmc+')] opacity-30" aria-hidden="true"></div>

        <div className="relative max-w-5xl mx-auto text-center">
          <p className="text-yellow-400 font-bold tracking-[0.3em] uppercase text-sm sm:text-base mb-4 animate-fade-in">
            Jones County High School
          </p>
          <h1 className="text-6xl sm:text-8xl lg:text-9xl font-black mb-6 tracking-tighter leading-none">
            CROSS
            <br />
            <span className="text-yellow-400">COUNTRY</span>
          </h1>
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm border border-white/20 px-8 py-4 rounded-full mb-6">
            <span className="font-bold text-xl sm:text-2xl tracking-wide">Home of the Greyhounds</span>
          </div>
          <TodayDate />
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-10">
        <UpcomingMeets />
      </main>
    </>
  )
}
