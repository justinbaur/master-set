import { auth } from "@/auth";

export default auth;

export const config = {
  matcher: [
    "/cards/new",
    "/cards/:path*/edit",
    "/collections/new",
    "/collections/:path*/edit",
    "/collections/:path*/cards/new",
  ],
};
