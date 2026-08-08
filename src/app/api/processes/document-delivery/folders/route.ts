import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DocumentSourceType } from '@/lib/document-delivery/types';
import { listRealGoogleDriveFolders } from '@/lib/document-delivery/connectors/google-drive-client';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sourceType = (searchParams.get('source_type') || 'google_drive') as DocumentSourceType;
    const parentId = searchParams.get('parent_id') || 'root';

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('id', session.user.id)
      .single();

    if (!profile?.account_id) {
      return NextResponse.json({ connected: false });
    }

    // Google Drive: Call real API v3
    if (sourceType === 'google_drive') {
      const realResult = await listRealGoogleDriveFolders(profile.account_id, parentId);
      if (realResult.connected) {
        return NextResponse.json(realResult);
      }

      // If GOOGLE_CLIENT_ID is set but user is not connected:
      if (process.env.GOOGLE_CLIENT_ID) {
        return NextResponse.json({ connected: false, folders: [] });
      }
    }

    // Fallback for providers where token is pending
    return NextResponse.json({
      connected: false,
      folders: [],
    });
  } catch (err: any) {
    console.error('Error fetching connector folders:', err);
    return NextResponse.json({ error: 'Falha ao listar pastas do repositório' }, { status: 500 });
  }
}
