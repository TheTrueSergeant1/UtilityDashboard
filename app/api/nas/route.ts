import { NextResponse } from 'next/server';
import si from 'systeminformation';

export async function GET() {
  try {
    const [cpu, mem, fs, net, os, system, diskLayout, temp] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.osInfo(),
      si.system(),
      si.diskLayout(),
      si.cpuTemperature()
    ]);

    return NextResponse.json({
      hardware: {
        manufacturer: system.manufacturer,
        model: system.model,
        cpuBrand: si.cpu().brand,
      },
      os: {
        distro: os.distro,
        release: os.release,
        arch: os.arch,
        hostname: os.hostname
      },
      cpu: {
        load: cpu.currentLoad,
        cores: cpu.cpus.map(c => c.load),
        temp: temp.main || 45 // Fallback if sensors missing
      },
      mem: {
        total: mem.total,
        used: mem.active,
        swaptotal: mem.swaptotal,
        swapused: mem.swapused
      },
      storage: {
        logical: fs.filter(d => d.size > 0),
        physical: diskLayout
      },
      net: net[0] // Primary interface
    });
  } catch (error) {
    return NextResponse.json({ error: 'Telemetry Failed' }, { status: 500 });
  }
}