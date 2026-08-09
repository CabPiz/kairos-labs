import { NextResponse } from "next/server";

const createMiddleware = jest.fn(() => jest.fn(() => NextResponse.next()));
export default createMiddleware;
