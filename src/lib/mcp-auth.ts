import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey, hasScope } from './api-keys';

export interface AuthenticatedRequest extends NextRequest {
  apiKeyData?: {
    id: string;
    label: string;
    scopes: string[];
    ownerId: string;
  };
}

/**
 * Middleware to authenticate MCP API requests
 */
export async function authenticateMcpRequest(
  request: NextRequest,
  requiredScope: string
): Promise<{ success: true; keyData: any } | { success: false; response: NextResponse }> {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Missing x-api-key header' },
        { status: 401 }
      ),
    };
  }

  const verification = await verifyApiKey(apiKey);

  if (!verification.valid || !verification.keyData) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid API key' },
        { status: 401 }
      ),
    };
  }

  if (!hasScope(verification.keyData.scopes, requiredScope)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: `Insufficient permissions. Required scope: ${requiredScope}` },
        { status: 403 }
      ),
    };
  }

  return {
    success: true,
    keyData: verification.keyData,
  };
}

/**
 * Helper function to create standardized error responses
 */
export function createErrorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      error: message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Helper function to create standardized success responses
 */
export function createSuccessResponse(data: any, metadata?: any) {
  const response: any = {
    data,
    timestamp: new Date().toISOString(),
  };

  if (metadata) {
    response.metadata = metadata;
  }

  return NextResponse.json(response);
}