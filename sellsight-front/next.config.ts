import type {NextConfig} from "next";
import * as path from "path"

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:8081';

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
// there are some ai features that i still did not plan an may gonna remove then just refactor them and remove files related to them not the kafka big data ones & on the front if there are static data not comming from the back e.g the landing page remove them and make the landing page have the navbar it looks empty and if u can give it
// a grid like desgin for the products on like instagram app , after u do this please create a file name it EXPLAIN.md where u explain me the current state and features coverd in this project and each file associated with what feature for backend/frontend and under each give me a commit message and what to commit as well