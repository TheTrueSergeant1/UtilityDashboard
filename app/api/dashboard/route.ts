import { NextResponse } from 'next/server';
import si from 'systeminformation';
import axios from 'axios';

export async function GET() {
  try {
    // 1. System Stats (Parallel Fetch)
    const [cpu, mem, os, net, fs] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.osInfo(),
      si.networkStats(),
      si.fsSize()
    ]);

    // 2. Service Health Checks & Quick Stats
    // We use Promise.allSettled so one failure doesn't crash the dashboard
    const services = await Promise.allSettled([
      axios.get(`${process.env.NEXT_PUBLIC_SONARR_URL}/api/v3/queue`, { 
        headers: { 'X-Api-Key': process.env.SONARR_KEY }, timeout: 2000 
      }),
      axios.get(`${process.env.NEXT_PUBLIC_RADARR_URL}/api/v3/queue`, { 
        headers: { 'X-Api-Key': process.env.RADARR_KEY }, timeout: 2000 
      }),
      axios.get(`${process.env.NEXT_PUBLIC_JELLYFIN_URL}/Sessions`, { 
        params: { api_key: process.env.JELLYFIN_KEY }, timeout: 2000 
      })
    ]);

    // Helper to extract data safely
    const getStatus = (result: any) => result.status === 'fulfilled' ? result.value.data : null;

    return NextResponse.json({
      system: {
        cpuTemp: cpu.currentLoad,
        cpuLoad: cpu.currentLoad,
        memUsed: mem.active,
        memTotal: mem.total,
        uptime: si.time().uptime,
        platform: os.platform,
        distro: os.distro,
        storage: fs.filter(d => d.size > 1000000000), // Only show drives > 1GB
        netTx: net[0]?.tx_sec || 0,
        netRx: net[0]?.rx_sec || 0,
      },
      services: {
        sonarr: { online: services[0].status === 'fulfilled', queue: getStatus(services[0])?.totalRecords ?? 0 },
        radarr: { online: services[1].status === 'fulfilled', queue: getStatus(services[1])?.totalRecords ?? 0 },
        jellyfin: { online: services[2].status === 'fulfilled', activeUsers: getStatus(services[2])?.length ?? 0 }
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Critical Dashboard Failure' }, { status: 500 });
  }
}