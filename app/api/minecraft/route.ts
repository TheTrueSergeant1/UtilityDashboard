import { NextResponse } from 'next/server';
import { Rcon } from 'rcon-client';

export async function POST(req: Request) {
  const body = await req.json();
  const { command } = body;

  try {
    const rcon = await Rcon.connect({
      host: process.env.MC_RCON_HOST || '127.0.0.1',
      port: parseInt(process.env.MC_RCON_PORT || '25575'),
      password: process.env.MC_RCON_PASSWORD || '',
    });

    const response = await rcon.send(command);
    await rcon.end();

    return NextResponse.json({ response });
  } catch (error: any) {
    return NextResponse.json({ response: `Error: ${error.message}` }, { status: 500 });
  }
}