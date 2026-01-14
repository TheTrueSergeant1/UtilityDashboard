import { NextResponse } from 'next/server';
import axios from 'axios';

const JF_URL = process.env.NEXT_PUBLIC_JELLYFIN_URL;
const JF_KEY = process.env.JELLYFIN_KEY;

export async function GET() {
  try {
    // Fetch Sessions (Who is watching), Users (Total count), and Logs (History)
    const [sessions, users, logs] = await Promise.all([
      axios.get(`${JF_URL}/Sessions`, { params: { api_key: JF_KEY } }),
      axios.get(`${JF_URL}/Users`, { params: { api_key: JF_KEY } }),
      axios.get(`${JF_URL}/System/ActivityLog/Entries`, { 
        params: { api_key: JF_KEY, limit: 15, sortOrder: 'Descending' } 
      })
    ]);

    return NextResponse.json({
      sessions: sessions.data,
      users: users.data,
      logs: logs.data.Items
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Jellyfin Sync Failed' }, { status: 500 });
  }
}