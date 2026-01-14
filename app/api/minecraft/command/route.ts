import { NextResponse } from 'next/server';
import { Rcon } from 'rcon-client';

export async function POST(req: Request) {
  const { command } = await req.json();

  try {
    const rcon = await Rcon.connect({
      host: process.env.MC_RCON_HOST,
      port: parseInt(process.env.MC_RCON_PORT || '25575'),
      password: process.env.MC_RCON_PASSWORD || '',
      timeout: 2000
    });

    const response = await rcon.send(command);
    await rcon.end();

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    return NextResponse.json({ success: false, response: `Error: ${error.message}` }, { status: 500 });
  }
}