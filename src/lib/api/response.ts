import { NextResponse } from "next/server";

export function apiSuccess<T>(body: T, init?: ResponseInit) {
  return NextResponse.json(body, init);
}

export function apiError(message: string, init?: ResponseInit) {
  return NextResponse.json({ error: message }, init);
}
