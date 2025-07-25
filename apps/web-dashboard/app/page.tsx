import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Welcome to HomeHost
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Revolutionary Gaming Hosting Platform
          </p>
        </div>
        
        <div className="space-y-4">
          {/* Main App Experience */}
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
            <h3 className="font-semibold text-gray-900 mb-2">🚀 Unified HomeHost Platform</h3>
            <div className="grid grid-cols-1 gap-2">
              <Link 
                href="/app"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                🏠 Sam&apos;s Dashboard (Community Builder)
              </Link>
              
              <Link 
                href="/app/alex"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                ⚡ Alex&apos;s Dashboard (Casual Host)
              </Link>
            </div>
          </div>

          {/* Individual Components */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">🧩 Individual Components</h3>
            <div className="space-y-2">
              <Link 
                href="/games"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                🎮 Game Library
              </Link>
              
              <Link 
                href="/communities"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                🏘️ Community Browser (Mock Data)
              </Link>
              
              <Link 
                href="/communities-live"
                className="w-full flex justify-center py-2 px-4 border border-green-300 rounded-md shadow-sm text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100"
              >
                🌐 Community Browser (Live API)
              </Link>
              
              <Link 
                href="/integration-test"
                className="w-full flex justify-center py-2 px-4 border border-blue-300 rounded-md shadow-sm text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
              >
                🧪 Integration Testing
              </Link>
              
              <Link 
                href="/marketplace"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                🛍️ Plugin Marketplace
              </Link>
              
              <Link 
                href="/console"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                🖥️ Server Console
              </Link>
            </div>
          </div>

          {/* Legacy Pages */}
          <div className="grid grid-cols-2 gap-2">
            <Link 
              href="/login"
              className="flex justify-center py-2 px-3 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              🔐 Sign In
            </Link>
            
            <Link 
              href="/dashboard"
              className="flex justify-center py-2 px-3 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              📊 Basic Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}