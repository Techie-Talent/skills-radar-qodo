import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revokeApiKey } from '@/lib/api-keys';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ keyId: string }> }
) {
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

    const { keyId } = await params;

    // Verify the key exists and belongs to the user
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    if (apiKey.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden - You can only revoke your own API keys' }, { status: 403 });
    }

    if (apiKey.revoked) {
      return NextResponse.json({ error: 'API key is already revoked' }, { status: 400 });
    }

    await revokeApiKey(keyId);

    return NextResponse.json({
      message: 'API key revoked successfully',
      key_id: keyId,
    });
  } catch (error) {
    console.error('Error revoking API key:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}