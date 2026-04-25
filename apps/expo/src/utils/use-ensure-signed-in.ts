import { useEffect, useRef } from "react";

import { authClient } from "./auth";

/**
 * Auto-signs the user in anonymously if there's no session yet. Call this
 * once at the app root (`_layout.tsx`) so that any deep-linked or
 * tab-bar-jumped-to screen has a session by the time it renders, instead
 * of relying on the home screen having mounted first.
 */
export function useEnsureSignedIn() {
  const { data: session, isPending } = authClient.useSession();
  const signingInRef = useRef(false);

  useEffect(() => {
    if (isPending || session || signingInRef.current) return;
    signingInRef.current = true;
    void authClient.signIn
      .anonymous()
      .then(async () => {
        const guestName = `Guest ${Math.floor(Math.random() * 9000) + 1000}`;
        await authClient.updateUser({ name: guestName });
      })
      .finally(() => {
        signingInRef.current = false;
      });
  }, [isPending, session]);

  return session;
}
