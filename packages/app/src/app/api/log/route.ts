import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo purposes (will reset on each deployment)
let logs: Array<{
  timestamp: string;
  demoUsed: string;
  stepsCompleted: number;
  sessionId?: string;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const { demoUsed, stepsCompleted, sessionId } = await request.json();
    
    if (!demoUsed) {
      return NextResponse.json(
        { error: 'Demo text is required' },
        { status: 400 }
      );
    }

    // Store the log entry (in memory - no PII)
    const logEntry = {
      timestamp: new Date().toISOString(),
      demoUsed: demoUsed.substring(0, 100), // Truncate for privacy
      stepsCompleted: stepsCompleted || 0,
      sessionId: sessionId || 'anonymous'
    };
    
    logs.push(logEntry);
    
    // Keep only last 100 entries to prevent memory issues
    if (logs.length > 100) {
      logs = logs.slice(-100);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Usage logged successfully',
      totalLogs: logs.length
    });
    
  } catch (error) {
    console.error('Logging error:', error);
    return NextResponse.json(
      { error: 'Failed to log usage' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to retrieve log statistics (no personal data)
export async function GET() {
  try {
    const stats = {
      totalSessions: logs.length,
      averageStepsCompleted: logs.length > 0 
        ? logs.reduce((sum, log) => sum + log.stepsCompleted, 0) / logs.length 
        : 0,
      lastActivity: logs.length > 0 ? logs[logs.length - 1].timestamp : null
    };
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve stats' },
      { status: 500 }
    );
  }
}
