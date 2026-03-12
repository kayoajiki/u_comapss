import { NextRequest, NextResponse } from 'next/server';
import { calcZiwei } from '@/lib/divination/ziwei';

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

  if (!body.birthtime) {
    return NextResponse.json(
      { error: 'TIME_REQUIRED', message: '紫微斗数の計算には出生時刻が必要です' },
      { status: 400 }
    );
  }

  if (!body.gender || (body.gender !== 'female' && body.gender !== 'male')) {
    return NextResponse.json(
      { error: 'INVALID_GENDER', message: 'gender は "female" または "male" で指定してください' },
      { status: 400 }
    );
  }

  const result = calcZiwei({
    birthdate: body.birthdate,
    birthtime: body.birthtime,
    gender: body.gender,
    birthplace: body.birthplace ?? null,
  });

  return NextResponse.json(result);
}
