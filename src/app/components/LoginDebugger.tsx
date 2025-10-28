'use client';
import { useState, useEffect } from 'react';

/**
 * Login Debugger - Shows real-time login status
 * Place this on login pages to debug token issues
 */
export default function LoginDebugger() {
  const [logs, setLogs] = useState<string[]>([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Intercept console.log to capture our debug messages
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      try {
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : 
          typeof arg === 'object' ? JSON.stringify(arg) : 
          String(arg)
        ).join(' ');
        
        if (message.includes('[Auth') || message.includes('🔐') || message.includes('✅') || message.includes('❌')) {
          setLogs(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ${message}`]);
        }
        originalLog(...args);
      } catch (error) {
        // Fallback if there's an issue
        originalLog(...args);
      }
    };

    console.error = (...args) => {
      try {
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : 
          typeof arg === 'object' ? JSON.stringify(arg) : 
          String(arg)
        ).join(' ');
        
        if (message.includes('[Auth') || message.includes('❌')) {
          setLogs(prev => [...prev.slice(-20), `${new Date().toLocaleTimeString()}: ❌ ${message}`]);
        }
        originalError(...args);
      } catch (error) {
        // Fallback if there's an issue
        originalError(...args);
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  const handleClear = () => {
    setLogs([]);
    localStorage.clear();
    alert('LocalStorage cleared! You can now try logging in again.');
  };

  const handleCheckTokens = () => {
    const access = localStorage.getItem('accessToken');
    const refresh = localStorage.getItem('refreshToken');
    
    setLogs(prev => [...prev, 
      `${new Date().toLocaleTimeString()}: === TOKEN CHECK ===`,
      `Access Token: ${access ? '✅ Present' : '❌ Missing'}`,
      `Refresh Token: ${refresh ? '✅ Present' : '❌ Missing'}`,
      `All keys: ${Object.keys(localStorage).join(', ')}`
    ]);
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="btn btn-sm btn-secondary position-fixed"
        style={{ bottom: '20px', right: '20px', zIndex: 9999 }}
      >
        <i className="bi bi-bug"></i> Debug
      </button>
    );
  }

  return (
    <div 
      className="position-fixed bg-dark text-white p-3 rounded shadow-lg"
      style={{ 
        bottom: '20px', 
        right: '20px', 
        width: '450px', 
        maxHeight: '400px',
        zIndex: 9999,
        fontSize: '12px',
        fontFamily: 'monospace'
      }}
    >
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong>🐛 Login Debug Console</strong>
        <button
          onClick={() => setShow(false)}
          className="btn btn-sm btn-close btn-close-white"
        ></button>
      </div>
      
      <div 
        className="bg-black p-2 rounded mb-2"
        style={{ 
          maxHeight: '250px', 
          overflowY: 'auto',
          fontSize: '11px'
        }}
      >
        {logs.length === 0 ? (
          <div className="text-muted">Waiting for login attempt...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="mb-1">{log}</div>
          ))
        )}
      </div>

      <div className="d-flex gap-2">
        <button
          onClick={handleCheckTokens}
          className="btn btn-sm btn-info flex-fill"
        >
          Check Tokens
        </button>
        <button
          onClick={handleClear}
          className="btn btn-sm btn-danger flex-fill"
        >
          Clear Storage
        </button>
        <button
          onClick={() => setLogs([])}
          className="btn btn-sm btn-secondary flex-fill"
        >
          Clear Logs
        </button>
      </div>
      
      <div className="mt-2">
        <small className="text-muted">
          Watch for: 🔐 Login → 🔑 Tokens → 💾 Stored → ✅ Success
        </small>
      </div>
    </div>
  );
}

