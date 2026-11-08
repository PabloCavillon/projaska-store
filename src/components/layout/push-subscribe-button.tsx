"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { getVapidPublicKey, subscribeToPush, unsubscribeFromPush } from "@/actions/push";

function urlBase64ToUint8Array(base64: string): ArrayBuffer {
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(b64);
    return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))).buffer;
}

interface Props {
    collapsed?: boolean;
}

export function PushSubscribeButton({ collapsed }: Props) {
    const [subscribed, setSubscribed] = useState(false);
    const [supported, setSupported] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return;
        setSupported(true);
        navigator.serviceWorker.ready.then((reg) =>
            reg.pushManager.getSubscription().then((sub) => setSubscribed(!!sub)),
        );
    }, []);

    if (!supported) return null;

    const handleToggle = async () => {
        setLoading(true);
        try {
            const reg = await navigator.serviceWorker.ready;

            if (subscribed) {
                const sub = await reg.pushManager.getSubscription();
                if (sub) {
                    await sub.unsubscribe();
                    await unsubscribeFromPush(sub.endpoint);
                }
                setSubscribed(false);
            } else {
                const permission = await Notification.requestPermission();
                if (permission !== "granted") return;

                const vapidKey = await getVapidPublicKey();
                const sub = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidKey),
                });
                const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
                await subscribeToPush({ endpoint: json.endpoint, keys: json.keys });
                setSubscribed(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            title={collapsed ? (subscribed ? "Desactivar notificaciones" : "Activar notificaciones") : undefined}
            className={`
                w-full flex items-center gap-3 px-3 py-3 uppercase text-sm text-left
                disabled:opacity-50 cursor-pointer
                ${subscribed
                    ? "text-pj dark:text-pj-ink hover:bg-zinc-100"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }
                ${collapsed ? "justify-center" : ""}
            `}
        >
            {subscribed ? <BellOff size={20} /> : <Bell size={20} />}
            {!collapsed && (
                <span>{subscribed ? "Notificaciones activas" : "Activar notificaciones"}</span>
            )}
        </button>
    );
}
