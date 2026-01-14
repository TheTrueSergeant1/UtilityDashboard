import { NextResponse } from 'next/server';
import axios from 'axios';

// This function runs on the server, not the user's phone
export async function GET() {
  try {
    // Fetch Sonarr Queue
    const sonarrQueue = await axios.get(`${process.env.NEXT_PUBLIC_SONARR_URL}/api/v3/queue`, {
      headers: { 'X-Api-Key': process.env.SONARR_KEY }
    });

    // Fetch Radarr Queue
    const radarrQueue = await axios.get(`${process.env.NEXT_PUBLIC_RADARR_URL}/api/v3/queue`, {
      headers: { 'X-Api-Key': process.env.RADARR_KEY }
    });

    return NextResponse.json({
      sonarr: sonarrQueue.data,
      radarr: radarrQueue.data
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}