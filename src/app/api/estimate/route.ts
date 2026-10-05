import { NextRequest, NextResponse } from "next/server";
import {
  estimate,
  GROUPS,
  QUOTAS,
  type GroupKey,
  type QuotaKey,
} from "@/lib/konkur-data";

export const dynamic = "force-dynamic";

const GROUP_KEYS = GROUPS.map((g) => g.key) as GroupKey[];
const QUOTA_KEYS = QUOTAS.map((q) => q.key) as QuotaKey[];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const group = String(body.group ?? "") as GroupKey;
    const quota = String(body.quota ?? "") as QuotaKey;
    const rankRaw = body.rank;
    const rankNum = Number(rankRaw);
    if (!GROUP_KEYS.includes(group)) {
      return NextResponse.json(
        { ok: false, error: "گروه آزمایشی نامعتبر است." },
        { status: 400 }
      );
    }
    if (!QUOTA_KEYS.includes(quota)) {
      return NextResponse.json(
        { ok: false, error: "سهمیه (منطقه) نامعتبر است." },
        { status: 400 }
      );
    }
    if (!rankRaw || !Number.isFinite(rankNum) || rankNum <= 0 || rankNum > 2_000_000) {
      return NextResponse.json(
        { ok: false, error: "رتبه وارد شده نامعتبر است." },
        { status: 400 }
      );
    }
    const result = estimate(group, quota, Math.floor(rankNum));
    return NextResponse.json({ ok: true, result });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "خطای داخلی سرور رخ داد." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const group = url.searchParams.get("group") as GroupKey | null;
  const quota = url.searchParams.get("quota") as QuotaKey | null;
  const rankRaw = url.searchParams.get("rank");
  const rankNum = Number(rankRaw);
  if (!group || !GROUP_KEYS.includes(group)) {
    return NextResponse.json(
      { ok: false, error: "گروه آزمایشی نامعتبر است." },
      { status: 400 }
    );
  }
  if (!quota || !QUOTA_KEYS.includes(quota)) {
    return NextResponse.json(
      { ok: false, error: "سهمیه (منطقه) نامعتبر است." },
      { status: 400 }
    );
  }
  if (!rankRaw || !Number.isFinite(rankNum) || rankNum <= 0) {
    return NextResponse.json(
      { ok: false, error: "رتبه وارد شده نامعتبر است." },
      { status: 400 }
    );
  }
  const result = estimate(group, quota, Math.floor(rankNum));
  return NextResponse.json({ ok: true, result });
}
