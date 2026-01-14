import { NextResponse } from 'next/server';
import axios from 'axios';

// Calculates dates for the calendar
const getDates = () => {
  const start = new Date().toISOString();
  const end = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days out
  return { start, end };
};

export async function GET() {
  const { start, end } = getDates();
  
  try {
    const [sonarrQueue, radarrQueue, sonarrCal, radarrHist] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_SONARR_URL}/api/v3/queue`, { headers: { 'X-Api-Key': process.env.SONARR_KEY } }),
      axios.get(`${process.env.NEXT_PUBLIC_RADARR_URL}/api/v3/queue`, { headers: { 'X-Api-Key': process.env.RADARR_KEY } }),
      axios.get(`${process.env.NEXT_PUBLIC_SONARR_URL}/api/v3/calendar?start=${start}&end=${end}`, { headers: { 'X-Api-Key': process.env.SONARR_KEY } }),
      axios.get(`${process.env.NEXT_PUBLIC_RADARR_URL}/api/v3/history?page=1&pageSize=15`, { headers: { 'X-Api-Key': process.env.RADARR_KEY } })
    ]);

    return NextResponse.json({
      queue: [...sonarrQueue.data.records, ...radarrQueue.data.records],
      calendar: sonarrCal.data,
      history: radarrHist.data.records
    });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}