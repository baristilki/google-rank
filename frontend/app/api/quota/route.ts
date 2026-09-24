import { NextRequest, NextResponse } from "next/server";
import {
  checkQuotaStatus,
  redeemVoucherCode,
  sanitizeDomain,
  sanitizeIp,
} from "@/lib/quotaManager";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain") || "";
    const code = searchParams.get("code") || null;

    const rawIp =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const status = checkQuotaStatus(domain, rawIp, code);

    return NextResponse.json({
      success: true,
      data: status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Kota sorgusu hatası" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, domain } = body;

    if (!code || !domain) {
      return NextResponse.json(
        {
          success: false,
          error: "Erişim kodu ve hedef alan adı (domain) zorunludur.",
        },
        { status: 400 }
      );
    }

    const result = redeemVoucherCode(code, domain);
    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
        },
        { status: 400 }
      );
    }

    const rawIp =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const status = checkQuotaStatus(domain, rawIp, code);

    return NextResponse.json({
      success: true,
      message: result.message,
      voucher: result.voucher,
      status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Kod doğrulama hatası" },
      { status: 500 }
    );
  }
}
