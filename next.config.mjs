/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.3.127'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
}

export default nextConfig
