import { NextRequest, NextResponse } from 'next/server';
import { calcBazi } from '@/lib/divination/bazi';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.birthdate) {
    return NextResponse.json(
      { error: 'INVALID_DATE', message: '生年月日を "YYYY-MM-DD" 形式で指定してください' },
      { status: 400 }
    );
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.birthdate)) {
    return NextResponse.json(
      { error: 'INVALID_DATE', message: '日付フォーマットが不正です（YYYY-MM-DD）' },
      { status: 400 }
    );
  }

  if (body.gender && body.gender !== 'female' && body.gender !== 'male') {
    return NextResponse.json(
      { error: 'INVALID_GENDER', message: 'gender は "female" または "male" で指定してください' },
      { status: 400 }
    );
  }

  const result = calcBazi({
    birthdate: body.birthdate,
    birthtime: body.birthtime ?? null,
    birthplace: body.birthplace ?? null,
    gender: body.gender ?? 'female',
  });

  return NextResponse.json(result);
}
