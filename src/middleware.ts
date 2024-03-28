import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import {
  ROUTES_DASHBOARD,
  ROUTES_DASHBOARD_CHANGE_EMAIL,
  ROUTES_LOGIN,
  ROUTES_REGISTER,
  ROUTES_VERIFICATION_EMAIL,
  ROUTES_VERIFICATION_MOBILE,
} from "../routes";

const isAuthenticated = (request: NextRequest) => {
  let verify = request.cookies.get("isAuth");
  if (!verify) return false;
  return true;
};

const hasVerifiedEmail = (request: NextRequest) => {
  const verify = request.cookies.get("hasEmailVerified");
  if (!verify) return false;
  return true;
};

const hasVerifiedPhoneNumber = (request: NextRequest) => {
  const verify = request.cookies.get("hasPhoneVerified");
  if (!verify) return false;
  return true;
};

export function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname;
  if (url == "/") return NextResponse.next();
  if ([ROUTES_LOGIN, ROUTES_REGISTER].includes(url)) {
    const isAuth = isAuthenticated(request);
    if (isAuth) {
      const redirectUrl = new URL(ROUTES_DASHBOARD, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  if ([ROUTES_VERIFICATION_EMAIL, ROUTES_VERIFICATION_MOBILE].includes(url)) {
    const isAuth = isAuthenticated(request);
    if (!isAuth) {
      // Redirect to login if not authenticated
      const redirectUrl = new URL(ROUTES_LOGIN, request.url);
      return NextResponse.redirect(redirectUrl);
    } else {
      if (url === ROUTES_VERIFICATION_EMAIL) {
        const hasEmailVerified = hasVerifiedEmail(request);
        if (hasEmailVerified) {
          if (!hasVerifiedPhoneNumber) {
            const redirectUrl = new URL(
              ROUTES_VERIFICATION_MOBILE,
              request.url
            );
            return NextResponse.redirect(redirectUrl);
          }
          // Redirect to dashboard if email verified
          const redirectUrl = new URL(ROUTES_DASHBOARD, request.url);
          return NextResponse.redirect(redirectUrl);
        }
      } else if (url === ROUTES_VERIFICATION_MOBILE) {
        const hasPhoneVerified = hasVerifiedPhoneNumber(request);
        if (hasPhoneVerified) {
          const redirectUrl = new URL(ROUTES_DASHBOARD, request.url);
          return NextResponse.redirect(redirectUrl);
        }
        if (!hasVerifiedEmail) {
          const redirectUrl = new URL(ROUTES_VERIFICATION_EMAIL, request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  }
  if (url === ROUTES_DASHBOARD) {
    const isAuth = isAuthenticated(request);
    if (!isAuth) {
      const redirectUrl = new URL(ROUTES_LOGIN, request.url);
      return NextResponse.redirect(redirectUrl);
    } else {
      const hasEmailVerified = hasVerifiedEmail(request);
      const hasPhoneVerified = hasVerifiedPhoneNumber(request);
      if (!hasEmailVerified || !hasPhoneVerified) {
        if (!hasEmailVerified) {
          const redirectUrl = new URL(ROUTES_VERIFICATION_EMAIL, request.url);
          return NextResponse.redirect(redirectUrl);
        }
        if (!hasPhoneVerified) {
          const redirectUrl = new URL(ROUTES_VERIFICATION_MOBILE, request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }
  }

  if (url === ROUTES_DASHBOARD_CHANGE_EMAIL) {
    const isAuth = isAuthenticated(request);
    if (!isAuth) {
      const redirectUrl = new URL(ROUTES_LOGIN, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
}
