import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Allow indexing once a custom domain is wired up.
        // Vercel's platform still sends `x-robots-tag: noindex` on
        // *.vercel.app URLs — that can only be removed by assigning a
        // custom domain (e.g. scroll-shared.boldandigital.com).
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "all" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

