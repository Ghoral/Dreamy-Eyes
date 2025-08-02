/* eslint-disable prettier/prettier */
import { createServerClient } from "@supabase/ssr";

import { NextResponse, type NextRequest } from "next/server";
import { authRoutes, publicRoute } from "./constant/authRoutes";

export const dynamic = "force-dynamic";

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let supabaseResponse = NextResponse.next();
  const cloneURL = request.nextUrl.clone();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const checkAndRefreshSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        cloneURL.pathname = authRoutes.login;
        return NextResponse.redirect(cloneURL);
      }

      const expirationDate = session?.expires_at
        ? new Date(session.expires_at * 1000)
        : null;
      const now = new Date();

      if (!expirationDate || expirationDate <= now) {
        await supabase.auth.signOut();
        cloneURL.pathname = authRoutes.login;
        return null;
      }

      return session;
    } catch (e) {
      cloneURL.pathname = authRoutes.login;
      return NextResponse.redirect(cloneURL);
    }
  };

  const session = await checkAndRefreshSession();

  // if (!session && !pathname.includes(publicRoute)) {
  //   if (pathname.includes(authRoutes.register.index)) {
  //     // Do nothing, allow access to register page
  //     return NextResponse.next();
  //   } else if (!pathname.includes(authRoutes.login)) {
  //     cloneURL.pathname = authRoutes.login;
  //     return NextResponse.redirect(cloneURL);
  //   }
  // }

  if (session) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, profile_setup_completed")
        .eq("id", user.id)
        .single();

      const cookieHeader = request.headers.get("cookie") || "";
      const hasAuthTokenCodeVerifier = cookieHeader.includes(
        "auth-token-code-verifier"
      );

      if (cloneURL.pathname === "/auth/otp-verification") {
        cloneURL.pathname = "/auth/otp-verification";
        return NextResponse.redirect(cloneURL);
      }

      if (
        user.id &&
        profile?.profile_setup_completed === true &&
        (pathname.includes(authRoutes.login) || pathname === "/")
      ) {
        cloneURL.pathname = "/auctions";
        return NextResponse.redirect(cloneURL);
      }

      if (
        user.id &&
        profile?.profile_setup_completed === false &&
        (pathname.includes(authRoutes.login) || pathname === "/")
      ) {
        cloneURL.pathname = "/auth/create-account";
        return NextResponse.redirect(cloneURL);
      }

      if (user.email_confirmed_at === null) {
        cloneURL.pathname = authRoutes.register.index;
        return NextResponse.redirect(cloneURL);
      }

      if (pathname === "auction" && !hasAuthTokenCodeVerifier) {
        cloneURL.pathname = "/";
        return NextResponse.redirect(cloneURL);
      }
    }
  }

  if (pathname.includes(publicRoute) && !session) {
    return supabaseResponse;
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
