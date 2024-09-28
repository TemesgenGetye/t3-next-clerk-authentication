import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public and protected routes
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)", "/"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, request) => {
  // If the route is not public, require authentication
  if (!isPublicRoute(request)) {
    auth().protect(); // This will let Clerk handle the auth logic
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, run for all other routes
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
