import { notifyAdminAuthExpired } from "@/services/admin-api/adminAuthEvents";
import { registerAdminHttpSessionBridge } from "@/services/admin-api/adminHttpSessionBridge";
import { loadAdminSession, updateAdminAccessToken } from "./auth.storage";

registerAdminHttpSessionBridge({
  readSession() {
    const session = loadAdminSession();
    if (!session) {
      return null;
    }
    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
    };
  },
  persistAccessToken: updateAdminAccessToken,
  notifyAuthExpired: notifyAdminAuthExpired,
});
