import process from "node:process";

import { createRemoteJWKSet, jwtVerify } from "jose";

import { getAdminEmails } from "./blog-api.server";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

export async function verifyAdmin(idToken: string): Promise<{ email: string; uid: string }> {
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("VITE_FIREBASE_PROJECT_ID is not set — add Firebase config to .env.");
  }
  if (!idToken) {
    throw new Error("Not signed in.");
  }

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });

  const email = typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;
  if (!email) {
    throw new Error("Token has no email.");
  }

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0 || !adminEmails.includes(email)) {
    throw new Error("This account is not authorized to manage the journal.");
  }

  return { email, uid: String(payload.sub) };
}
