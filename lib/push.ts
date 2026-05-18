import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

if (publicKey && privateKey) {
  webpush.setVapidDetails(
    "mailto:support@pinglly.in", // Replace with your support email
    publicKey,
    privateKey
  );
} else {
  console.warn("VAPID keys are missing. Web push notifications will not work.");
}

export async function sendPushNotification(
  subscription: webpush.PushSubscription,
  payload: { title: string; body: string; url?: string }
) {
  if (!publicKey || !privateKey) return false;
  
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}
