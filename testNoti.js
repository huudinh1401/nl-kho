// testNoti.js
const expoPushUrl = "https://exp.host/--/api/v2/push/send";

async function sendPushNotification() {
    const messages = [
        {
            to: "ExponentPushToken[W2Xw93JfwHavUOSJeRUHcD]",
            sound: "default",
            title: "Duyệt phiếu",
            body: "Bạn có phiếu xuất cần duyệt gấp!",
        },
        {
            to: "ExponentPushToken[W2Xw93JfwHavUOSJeRUHcDsdsd]", // token khác
            sound: "default",
            title: "Duyệt phiếu",
            body: "Có phiếu chờ duyệt!",
        },
        // ... thêm bao nhiêu cũng được
    ];

    const response = await fetch(expoPushUrl, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
    });

    const data = await response.json();
    console.log("Kết quả:", data);
}

sendPushNotification().catch(console.error);
