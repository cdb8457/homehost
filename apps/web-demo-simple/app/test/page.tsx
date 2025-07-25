'use client';

import { useState } from 'react';

export default function TestPage() {
  const [result, setResult] = useState<string>('');

  const testBackend = async () => {
    console.log('🧪 Testing backend...');
    try {
      const response = await fetch('http://localhost:3002/health');
      const data = await response.json();
      console.log('🧪 Backend response:', data);
      setResult('Backend: ' + JSON.stringify(data));
    } catch (error) {
      console.error('🧪 Backend error:', error);
      setResult('Backend error: ' + error);
    }
  };

  const testLogin = async () => {
    console.log('🧪 Testing login...');
    try {
      const response = await fetch('http://localhost:3002/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password'
        })
      });
      const data = await response.json();
      console.log('🧪 Login response:', data);
      setResult('Login: ' + JSON.stringify(data));
    } catch (error) {
      console.error('🧪 Login error:', error);
      setResult('Login error: ' + error);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Backend Test</h1>
      <div className="space-y-4">
        <button 
          onClick={testBackend}
          className="bg-blue-500 text-white px-4 py-2 rounded mr-4"
        >
          Test Backend Health
        </button>
        <button 
          onClick={testLogin}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Login API
        </button>
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{result}</pre>
        </div>
      </div>
    </div>
  );
}