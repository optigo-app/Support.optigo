import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const AllowedDomains = ["localhost", "http://calllog.web/", "http://calllog.web/", "calllog.web"];

const ALLOWED_COMPANY = "optigohub";

// if (process.env.NODE_ENV === "development" || AllowedDomains.some((domain) => window.location.hostname.includes(domain))) {
//   Cookies.set("skey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpdGFzayIsImF1ZCI6ImFtVnVhWE5BWldjdVkyOXQiLCJleHAiOjE3NDYxODg3NDgsInVpZCI6ImFtVnVhWE5BWldjdVkyOXQiLCJ5YyI6ImUzdHVlbVZ1ZlgxN2V6SXdmWDE3ZTI5eVlXbHNNalY5Zlh0N2IzSmhhV3d5TlgxOSIsInN2IjoiMCJ9.Ui_Taj21Fb8oDWvhEc8IwHJZTeFxUos46Jb6H4Iyk8M", { path: "/" });
//   // Cookies.set("skey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpdGFzayIsImF1ZCI6IllXMXlkWFJBWldjdVkyOXQiLCJleHAiOjE3NDcxMzk2ODYsInVpZCI6IllXMXlkWFJBWldjdVkyOXQiLCJ5YyI6ImUzdHVlbVZ1ZlgxN2V6SXdmWDE3ZTI5eVlXbHNNalY5Zlh0N2IzSmhhV3d5TlgxOSIsInN2IjoiMCJ9.m4NonzyJfWdM0frEq1Cn4h1ABThBa1wgosx8Z7Mg5VI", { path: "/" });
// }
// Amrut Sir Login Cookies
// if (process.env.NODE_ENV === 'development') {
//     console.log("AuthUtils.js is running in development mode");
// }

// LIVE Testing Cookie
// if (process.env.NODE_ENV === "development" || AllowedDomains.some((domain) => window.location.hostname.includes(domain))) {
// 	Cookies.set("skey", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpdGFzayIsImF1ZCI6ImNtRnFZVzR1Y0VCdmNtRnBiQzVwYmc9PSIsImV4cCI6MTc1Njc5MjMwOCwidWlkIjoiY21GcVlXNHVjRUJ2Y21GcGJDNXBiZz09IiwieWMiOiJlM3RzYVhabExtOXdkR2xuYjJGd2NITXVZMjl0ZlgxN2V6SXdmWDE3ZTI5d2RHbG5iMmgxWW4xOWUzdHZjSFJwWjI5b2RXSjlmUT09Iiwic3YiOiIxIn0.27EeeBr3CxvX3yb45FgfzWZcNOpt_pQx_9lUubpYNAA", { path: "/" });
// }
export function decodeBase64(base64Str) {
  try {
    return decodeURIComponent(
      atob(base64Str)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
  } catch (error) {
    console.error("Base64 decoding failed:", error);
    return null;
  }
}

export function GetCredentialsFromCookie() {
  try {
    const token = Cookies.get("skey");
    if (!token) {
      console.warn("skey cookie not found");
      return null;
    }
    const decoded = jwtDecode(token);
    const companyEncoded = decoded?.uid;
    const user = companyEncoded ? decodeBase64(companyEncoded) : null;
    // if (process.env.NODE_ENV === "production") {
    //   const ycDecoded = decoded?.yc ? decodeBase64(decoded.yc) : null;

    //   if (!ycDecoded) {
    //     console.warn("yc field missing or not decodable");
    //     return null;
    //   }

    //   const ycSegments = ycDecoded.match(/{{(.*?)}}/g)?.map((s) => s.replace(/[{}]/g, ""));

    //   const hasAccess = ycSegments?.some((segment) => segment.toLowerCase() === ALLOWED_COMPANY);
    //   if (!hasAccess) {
    //     console.warn("Access denied: company not allowed");
    //     return null;
    //   }
    // }
    return {
      ...decoded,
      userId: user,
    };
  } catch (error) {
    console.error("Failed to parse JWT from skey cookie:", error);
    return null;
  }
}

export function removeSkeyCookie() {
  const cookieOptions = { path: "/", sameSite: "Lax" };
  Cookies.remove("skey", cookieOptions);
  Cookies.remove("skey", { path: "/" });
  const domain = window.location.hostname;
  if (domain && domain !== "localhost" && domain !== "127.0.0.1") {
    Cookies.remove("skey", { path: "/", domain });
  }
}

// export function createAndStoreToken(payload, expiresIn = '7d') {
//     try {
//       const token = jwt.sign(payload, 'TOP_SECRET_KEY', { expiresIn });
//       const cookieOptions = {
//         path: '/',
//         secure: process.env.NODE_ENV === 'production',
//         expires: 7,
//         sameSite: 'strict',
//       };

//       // 3. Store token in cookie
//       Cookies.set('skey', token, cookieOptions);

//       console.log("JWT token created and stored in cookie.");

//       return token;
//     } catch (error) {
//       console.error("Failed to create/store JWT token:", error);
//       return null;
//     }
//   }
