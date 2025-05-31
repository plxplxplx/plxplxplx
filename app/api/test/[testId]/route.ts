// app/api/test/[testId]/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface ResolvedTestParams {
  testId: string;
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<ResolvedTestParams> } // context.params is the Promise
) {
  try {
    const resolvedParams = await context.params; // Await context.params
    const testIdValue = resolvedParams.testId;
    return NextResponse.json({ receivedTestId: testIdValue });
  } catch (error) {
    console.error("Error resolving context.params:", error);
    return NextResponse.json({ error: "Failed to resolve route parameters" }, { status: 500 });
  }
}