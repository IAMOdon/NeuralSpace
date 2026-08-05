import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session so it doesn't expire mid-visit
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const guarded = pathname.startsWith("/dashboard") || pathname.startsWith("/api/toolbox");

  if (guarded) {
    // Signup is self-service, so a session proves nothing about authority:
    // require membership in public.admins, which RLS lets the caller read for
    // themselves. This is the outer gate only — AdminLayout, every server
    // action and every toolbox route re-check independently, since middleware
    // must never be the sole boundary.
    let admin = false;
    if (user) {
      const { data } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      admin = data !== null;
    }

    if (!admin) {
      // API callers get a status they can act on; humans get the login page.
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/toolbox/:path*"],
};

