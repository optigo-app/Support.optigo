import { toast } from "../components/_ui/Toaster";

// Subtle notification chime using Web Audio API
const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.28);
    } catch {
        // Ignore audio autoplay policy restrictions if not yet interacted
    }
};

export const showBrowserNotification = async ({
    title,
    body,
    icon = "/ic_stat_o.png",
    badge = "/ic_stat_o.png",
    data,
    ...restOptions
}) => {
    // Load current user preferences directly from localStorage
    const prefs = (() => {
        try {
            const stored = localStorage.getItem("notif_prefs");
            const defaults = {
                browserEnabled: false,
                inAppEnabled: true,
                soundEnabled: true,
                onNewCall: true,
                onTicketCreate: true,
                onTicketUpdate: true,
                onComment: true,
            };
            return stored ? { ...defaults, ...JSON.parse(stored) } : defaults;
        } catch {
            return {
                browserEnabled: false,
                inAppEnabled: true,
                soundEnabled: true,
                onNewCall: true,
                onTicketCreate: true,
                onTicketUpdate: true,
                onComment: true,
            };
        }
    })();

    // Check specific event category toggles
    const type = data?.type;
    if (type) {
        if ((type === "ADD_CALL" || type === "FORWARDED_CALL" || type === "ACCEPT_CALL") && !prefs.onNewCall) {
            return;
        }
        if (type === "CREATE_TICKET" && !prefs.onTicketCreate) {
            return;
        }
        if ((type === "UPDATE_TICKET" || type === "CLOSE_TICKET") && !prefs.onTicketUpdate) {
            return;
        }
        if (type === "TICKET_COMMENT" && !prefs.onComment) {
            return;
        }
    }

    let hasDisplayedAlert = false;

    // 1. Browser Notification (Desktop Push alert)
    if (prefs.browserEnabled && "Notification" in window) {
        if (Notification.permission === "granted") {
            hasDisplayedAlert = true;
            if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.ready
                    .then((reg) => {
                        reg.showNotification(title, { body, icon, badge, data, ...restOptions });
                    })
                    .catch(() => {
                        try {
                            new Notification(title, { body, icon, badge, data, ...restOptions });
                        } catch {}
                    });
            } else {
                try {
                    new Notification(title, { body, icon, badge, data, ...restOptions });
                } catch {}
            }
        }
    }

    // 2. In-App Notification (Toast alert)
    if (prefs.inAppEnabled) {
        hasDisplayedAlert = true;
        toast({
            title,
            description: body,
            button: {
                label: "Reply",
            },
            data: data,
        });
    }

    // 3. Sound Alert (if enabled and at least one visual alert is shown)
    if (prefs.soundEnabled && hasDisplayedAlert) {
        playNotificationSound();
    }
};
