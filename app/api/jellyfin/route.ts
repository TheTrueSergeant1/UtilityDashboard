import { NextResponse } from 'next/server';
import axios from 'axios';

const JF_URL = process.env.NEXT_PUBLIC_JELLYFIN_URL;
const JF_KEY = process.env.JELLYFIN_KEY;

export async function GET() {
  try {
    const response = await axios.get(`${JF_URL}/Sessions`, {
      params: { api_key: JF_KEY }
    });
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json([], { status: 200 }); // Return empty array on error so UI doesn't crash
  }
}