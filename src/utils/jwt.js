import { SignJWT } from "jose";
import sign from "jwt-encode";

// Base64 encoding (unchanged)
const encodeBase64 = (str) => btoa(str);

export async function createJWT(userInfo) {
  if (!userInfo?.userid) {
    throw new Error("Missing userid for JWT");
  }

  const base64UserId = encodeBase64(userInfo.userid);

  const payload = {
    iss: "support.optigo",
    aud: base64UserId,
    uid: base64UserId,
    yc: userInfo.yearcode,
    sv: userInfo.svid,
  };

  // Use a secure secret from environment (fallback for dev)
  const secretString =
    process.env.JWT_SECRET || "your-strong-random-secret-min-32-chars"; // NEVER hardcode in production!

  try {
    const domain =
      typeof window !== "undefined" ? window.location.hostname : "";
    const isLocalDomain =
      domain === "nzen" ||
      domain === "localhost" ||
      domain === "127.0.0.1" ||
      domain.endsWith(".web");

    if (isLocalDomain || process.env.NODE_ENV === "development") {
      return sign(payload, secretString);
    } else {
      const secret = new TextEncoder().encode(secretString);
      const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("2d")
        .sign(secret);

      return jwt;
    }
  } catch (error) {
    console.error("JWT signing failed:", error);
    throw new Error(
      "Failed to create JWT. Ensure secure context (HTTPS) and check secret.",
    );
  }
}
