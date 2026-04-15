import type {NextConfig} from "next";
import * as path from "path"

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:8080';

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
    /* config options here */
    turbopack: {
        root: path.resolve(__dirname)
    }
};

export default nextConfig;
