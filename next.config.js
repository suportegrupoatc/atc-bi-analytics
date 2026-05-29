/** @type {import('next').NextConfig} */

// Fix SSL certificate verification issue in development only (Windows)
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const nextConfig = {}
module.exports = nextConfig
