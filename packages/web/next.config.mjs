/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@student-tracker/shared"],
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn1.iconfinder.com",
            },
        ],
    },
};

export default nextConfig;
