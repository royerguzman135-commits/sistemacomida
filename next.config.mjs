/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Sacamos la opción de 'experimental' y la ponemos aquí en la raíz
  allowedDevOrigins: ['192.168.0.13'],
}

export default nextConfig