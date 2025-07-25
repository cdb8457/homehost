'use client';

import { useState, useEffect } from 'react';
import { homeHostAPI } from '@/lib/homehost-api';
import { Community } from '@/types/community';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  PlayCircle,
  Database,
  Wifi,
  Users,
  Plus,
  Search,
  TrendingUp,
  Star,
  AlertTriangle
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  duration?: number;
  data?: any;
}

export default function IntegrationTester() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Backend Connection', status: 'pending' },
    { name: 'Health Check', status: 'pending' },
    { name: 'Authentication', status: 'pending' },
    { name: 'Get Communities', status: 'pending' },
    { name: 'Search Communities', status: 'pending' },
    { name: 'Get Trending', status: 'pending' },
    { name: 'Get Recommendations', status: 'pending' },
    { name: 'Create Community', status: 'pending' },
    { name: 'Join Community', status: 'pending' },
    { name: 'Community Members', status: 'pending' },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [testCommunityId, setTestCommunityId] = useState<string | null>(null);
  const [authStatus, setAuthStatus] = useState<'unauthenticated' | 'authenticated'>('unauthenticated');

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests(prev => prev.map(test => 
      test.name === name ? { ...test, ...updates } : test
    ));
  };

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    const startTime = Date.now();
    updateTest(testName, { status: 'running' });

    try {
      const result = await testFn();
      const duration = Date.now() - startTime;
      updateTest(testName, { 
        status: 'success', 
        message: 'Passed',
        duration,
        data: result
      });
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest(testName, { 
        status: 'error', 
        message: error.message,
        duration
      });
      throw error;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    try {
      // Test 1: Backend Connection
      await runTest('Backend Connection', async () => {
        const connected = await homeHostAPI.testConnection();
        if (!connected) throw new Error('Cannot connect to backend API');
        return { connected: true };
      });

      // Test 2: Health Check
      await runTest('Health Check', async () => {
        const health = await homeHostAPI.healthCheck();
        if (health.status !== 'Healthy') throw new Error(`Health status: ${health.status}`);
        return health;
      });

      // Test 3: Authentication
      await runTest('Authentication', async () => {
        const authResult = await homeHostAPI.login('alex@homehost.com', 'password123');
        setAuthStatus('authenticated');
        return { user: authResult.user };
      });

      // Test 4: Get Communities
      const communities = await runTest('Get Communities', async () => {
        const result = await homeHostAPI.getCommunities();
        if (!Array.isArray(result)) throw new Error('Communities response is not an array');
        return { count: result.length, communities: result.slice(0, 3) };
      });

      // Test 5: Search Communities
      await runTest('Search Communities', async () => {
        const result = await homeHostAPI.searchCommunities('Valheim');
        if (!Array.isArray(result)) throw new Error('Search response is not an array');
        return { count: result.length, searchTerm: 'Valheim' };
      });

      // Test 6: Get Trending
      await runTest('Get Trending', async () => {
        const result = await homeHostAPI.getTrendingCommunities();
        if (!Array.isArray(result)) throw new Error('Trending response is not an array');
        return { count: result.length };
      });

      // Test 7: Get Recommendations
      await runTest('Get Recommendations', async () => {
        const result = await homeHostAPI.getRecommendedCommunities();
        if (!Array.isArray(result)) throw new Error('Recommendations response is not an array');
        return { count: result.length };
      });

      // Test 8: Create Community
      const newCommunity = await runTest('Create Community', async () => {
        const testCommunity = {
          name: `Integration Test Community ${Date.now()}`,
          description: 'This is a test community created by the integration tester',
          brandColors: {
            primary: '#3b82f6',
            secondary: '#1d4ed8'
          },
          joinType: 'open' as const,
          region: 'North America',
          games: ['Test Game'],
          tags: ['integration', 'test']
        };

        const result = await homeHostAPI.createCommunity(testCommunity);
        setTestCommunityId(result.id);
        return { id: result.id, name: result.name };
      });

      // Test 9: Join Community
      if (testCommunityId || newCommunity?.data?.id) {
        const communityId = testCommunityId || newCommunity.data.id;
        await runTest('Join Community', async () => {
          await homeHostAPI.joinCommunity(communityId);
          return { communityId, action: 'joined' };
        });

        // Test 10: Community Members
        await runTest('Community Members', async () => {
          const members = await homeHostAPI.getCommunityMembers(communityId);
          if (!Array.isArray(members)) throw new Error('Members response is not an array');
          return { count: members.length, communityId };
        });
      } else {
        updateTest('Join Community', { 
          status: 'error', 
          message: 'No test community available' 
        });
        updateTest('Community Members', { 
          status: 'error', 
          message: 'No test community available' 
        });
      }

    } catch (error) {
      console.error('Test suite failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getTestIcon = (test: TestResult) => {
    switch (test.status) {
      case 'pending':
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>;
      case 'running':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getTestDescription = (testName: string) => {
    const descriptions = {
      'Backend Connection': 'Test basic connectivity to HomeHost Cloud API',
      'Health Check': 'Verify API health endpoint responds correctly',
      'Authentication': 'Login with test credentials and receive JWT token',
      'Get Communities': 'Fetch all communities from the API',
      'Search Communities': 'Search for communities by name/game',
      'Get Trending': 'Fetch trending communities list',
      'Get Recommendations': 'Get personalized community recommendations',
      'Create Community': 'Create a new test community',
      'Join Community': 'Join the newly created community',
      'Community Members': 'Fetch members of the test community'
    };
    return descriptions[testName] || '';
  };

  const successCount = tests.filter(t => t.status === 'success').length;
  const errorCount = tests.filter(t => t.status === 'error').length;
  const successRate = tests.length > 0 ? Math.round((successCount / tests.length) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Epic 2 Integration Testing
        </h1>
        <p className="text-gray-600">
          Test frontend-backend connectivity and Epic 2 Community features end-to-end
        </p>
        
        {/* Status Overview */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Connection</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {tests.find(t => t.name === 'Backend Connection')?.status === 'success' ? 'Online' : 'Offline'}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-900">Success Rate</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <span className="font-medium text-purple-900">Auth Status</span>
            </div>
            <div className="text-sm font-medium text-purple-600 capitalize">{authStatus}</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-900">Tests</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{successCount}/{tests.length}</div>
          </div>
        </div>
      </div>

      {/* Run Tests Button */}
      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <PlayCircle className="w-5 h-5" />
              Run Integration Tests
            </>
          )}
        </button>
      </div>

      {/* Test Results */}
      <div className="space-y-3">
        {tests.map((test) => (
          <div
            key={test.name}
            className={`p-4 border rounded-lg transition-colors ${
              test.status === 'success' 
                ? 'border-green-200 bg-green-50' 
                : test.status === 'error'
                ? 'border-red-200 bg-red-50'
                : test.status === 'running'
                ? 'border-blue-200 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getTestIcon(test)}
                <div>
                  <h3 className="font-medium text-gray-900">{test.name}</h3>
                  <p className="text-sm text-gray-600">{getTestDescription(test.name)}</p>
                </div>
              </div>
              
              <div className="text-right">
                {test.duration && (
                  <div className="text-xs text-gray-500">{test.duration}ms</div>
                )}
                {test.status === 'success' && test.data && (
                  <div className="text-xs text-green-600">
                    {typeof test.data === 'object' && test.data.count !== undefined 
                      ? `${test.data.count} items`
                      : 'Success'
                    }
                  </div>
                )}
                {test.status === 'error' && test.message && (
                  <div className="text-xs text-red-600 max-w-xs truncate">
                    {test.message}
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Results */}
            {test.status === 'success' && test.data && (
              <div className="mt-3 p-3 bg-white rounded border">
                <pre className="text-xs text-gray-700 overflow-auto max-h-32">
                  {JSON.stringify(test.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      {!isRunning && (successCount > 0 || errorCount > 0) && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successCount}</div>
              <div className="text-sm text-gray-600">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{errorCount}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
          
          {successRate === 100 && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center">
              🎉 All tests passed! Epic 2 integration is working perfectly.
            </div>
          )}
          
          {successRate < 100 && successRate > 0 && (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg text-center">
              ⚠️ Some tests failed. Check the error messages above.
            </div>
          )}
          
          {successRate === 0 && errorCount > 0 && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg text-center">
              ❌ Integration tests failed. Ensure the backend API is running.
            </div>
          )}
        </div>
      )}
    </div>
  );
}