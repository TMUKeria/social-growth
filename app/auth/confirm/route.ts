import type { EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const resultUrl = request.nextUrl.clone();

  resultUrl.pathname = "/auth/confirmed";
  resultUrl.search = "";

  if (!tokenHash || !type) {
    resultUrl.searchParams.set("status", "invalid-link");
    return NextResponse.redirect(resultUrl);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    resultUrl.searchParams.set("status", "verification-failed");
  }

  return NextResponse.redirect(resultUrl);
}
