import { NextResponse } from "next/server";

export async function GET () {
	return NextResponse.json({
		status: 1,
		message: "API Status: active"
	})
}