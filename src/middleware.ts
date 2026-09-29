import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames including `/` and any `/<locale>/...` route.
  // The negative lookaheads exclude API routes, Next internals, Vercel
  // internals and dotfiles (favicon.ico etc.).
  matcher: [
    "/",
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
