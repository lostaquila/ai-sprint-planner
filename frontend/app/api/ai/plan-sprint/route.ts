import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tickets, capacity } = body;

    // Validate input
    if (!Array.isArray(tickets)) {
      return NextResponse.json(
        { error: 'Tickets must be an array' },
        { status: 400 }
      );
    }

    if (!capacity || typeof capacity !== 'number' || capacity <= 0) {
      return NextResponse.json(
        { error: 'Capacity must be a positive number' },
        { status: 400 }
      );
    }

    // Get n8n URL from environment variable
    const n8nUrl = process.env.N8N_PLAN_SPRINT_URL;
    if (!n8nUrl) {
      console.error('N8N_PLAN_SPRINT_URL is not set');
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    // Call n8n with POST request
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tickets, capacity }),
    });

    // Get the response data
    const data = await response.json();

    // Forward the JSON from n8n back to the client with the same status code
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    // On unexpected error, return 500
    console.error('Error in plan-sprint route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

