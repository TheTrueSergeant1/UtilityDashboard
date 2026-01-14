import { NextResponse } from 'next/server';
import si from 'systeminformation';

export async function GET() {
  try {
    const [stats, interfaces, connections] = await Promise.all([
      si.networkStats(),           // Speed (RX/TX)
      si.networkInterfaces(),      // IPs, MACs
      si.networkConnections()      // Active Ports/Sockets
    ]);

    // Filter out internal/loopback interfaces to keep it clean
    const validInterfaces = Array.isArray(interfaces) 
      ? interfaces.filter(i => !i.internal && !i.virtual && i.operstate === 'up')
      : [];

    // Filter connections to show only interesting traffic (Established or Listening)
    // We sort by state to group LISTEN vs ESTABLISHED
    const activeConnections = Array.isArray(connections)
      ? connections
          .filter(c => c.state === 'ESTABLISHED' || c.state === 'LISTEN')
          .slice(0, 30) // Limit to top 30 to prevent UI lag
      : [];

    return NextResponse.json({
      speed: stats[0] || { rx_sec: 0, tx_sec: 0 },
      interfaces: validInterfaces,
      connections: activeConnections
    });
  } catch (error) {
    return NextResponse.json({ error: 'Network Probe Failed' }, { status: 500 });
  }
}