/**
 * ============================================================================
 * VERIFY API ENDPOINT
 * ============================================================================
 * 
 * POST /api/verify
 * 
 * Endpoint to verify text humanness without humanizing
 * Useful for testing your own text or comparing results
 * 
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyOnly } from '@/lib/humanizer';
import { ApiResponse, VerificationResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Text is required and must be a string'
      }, { status: 400 });
    }

    if (body.text.trim().length < 10) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Text must be at least 10 characters long'
      }, { status: 400 });
    }

    // Verify the text
    const result = await verifyOnly(body.text.trim());

    return NextResponse.json<ApiResponse<VerificationResult>>({
      success: true,
      data: result,
      message: result.passed 
        ? `Text appears human! Score: ${(result.score * 100).toFixed(1)}%`
        : `Text may be detected as AI. Score: ${(result.score * 100).toFixed(1)}%`
    });

  } catch (error) {
    console.error('Verify API error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error: 'Method not allowed. Use POST.'
  }, { status: 405 });
}
