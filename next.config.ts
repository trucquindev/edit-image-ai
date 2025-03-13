import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['res.cloudinary.com'], // Thêm Cloudinary vào danh sách domain hợp lệ
  },
};

export default nextConfig;
