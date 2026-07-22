export async function sendTelegramAlert(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "8717572502:AAGkH_ZFzMS0QTj4jtATcWai2s0s-Ttb41s";
  const chatId = process.env.TELEGRAM_CHAT_ID || "8641759984";

  if (!token || !chatId) {
    console.log("[Telegram Alert Skipped - Missing ENV]:", message);
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown",
      }),
    });
  } catch (error) {
    console.error("[Telegram Notification Error]:", error);
  }
}
