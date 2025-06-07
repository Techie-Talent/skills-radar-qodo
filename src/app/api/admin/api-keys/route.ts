import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createApiKey, listApiKeys, AVAILABLE_SCOPES } from '@/lib/api-keys';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const isAdmin = user?.role?.permissions.some(
      (rp) => rp.permission.category === 'admin' && rp.permission.action === 'manage'
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const apiKeys = await listApiKeys(session.user.id);
    
    return NextResponse.json({
      data: apiKeys,
      available_scopes: AVAILABLE_SCOPES,
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    const isAdmin = user?.role?.permissions.some(
      (rp) => rp.permission.category === 'admin' && rp.permission.action === 'manage'
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { label, scopes } = body;

    if (!label || !scopes || !Array.isArray(scopes)) {
      return NextResponse.json(
        { error: 'Missing required fields: label and scopes' },
        { status: 400 }
      );
    }

    // Validate scopes
    const invalidScopes = scopes.filter(scope => !AVAILABLE_SCOPES.includes(scope as any));
    if (invalidScopes.length > 0) {
      return NextResponse.json(
        { error: `Invalid scopes: ${invalidScopes.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await createApiKey({
      label,
      scopes,
      ownerId: session.user.id,
    });

    return NextResponse.json({
      message: 'API key created successfully',
      api_key: result.apiKey, // Only shown once
      key_data: result.keyData,
      warning: 'Save this API key now. You will not be able to see it again.',
    });
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}