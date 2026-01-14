import { NextResponse } from 'next/server';
import { Rcon } from 'rcon-client';

export async function GET() {
  const host = process.env.MC_RCON_HOST;
  const port = parseInt(process.env.MC_RCON_PORT || '25575');
  const password = process.env.MC_RCON_PASSWORD || '';

  try {
    const rcon = await Rcon.connect({ host, port, password, timeout: 2000 });
    
    // Run commands in parallel to be fast
    const [listRaw, versionRaw] = await Promise.all([
      rcon.send('list'),   // "There are 1 of 20 players online: Notch"
      rcon.send('version') // Varies, but usually returns the version
    ]);

    await rcon.end();

    // Parse the Player List
    let players: string[] = [];
    if (listRaw.includes(':')) {
      const namesPart = listRaw.split(':')[1];
      if (namesPart) {
        players = namesPart.split(',').map(p => p.trim()).filter(p => p.length > 0);
      }
    }

    return NextResponse.json({
      online: true,
      version: versionRaw,
      players: players,
      rawList: listRaw
    });

  } catch (error) {
    // If we can't connect, the server is offline
    return NextResponse.json({ 
      online: false, 
      version: 'Unknown', 
      players: [] 
    });
  }
}