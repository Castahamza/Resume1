/** @type {import('next').NextConfig} */
const nextConfig = {
  // Environment variables: use NEXT_PUBLIC_* for client bundles; others are server-only automatically.
  // Set values in Vercel Project Settings → Environment Variables (Production / Preview / Development).

  images: {
    // Add hostnames if you switch to next/image for remote assets (e.g. Supabase Storage, CDNs).
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Optional: silence strict mode warnings from dependencies during build
  // reactStrictMode: true, // default in Next.js
};

export default nextConfig;
