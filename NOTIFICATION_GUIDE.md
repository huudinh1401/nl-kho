# 🔔 Hướng dẫn sử dụng Notification System

## ✅ Đã cài đặt và cấu hình

### 📦 Packages đã cài:
- `expo-notifications` - Quản lý push notifications
- `expo-device` - Kiểm tra device type

### 🔧 Files đã tạo/sửa:
1. **`src/services/notificationService.js`** - Service quản lý notifications
2. **`src/screens/LoginScreen.js`** - Tích hợp notification vào login
3. **`app.json`** - Cấu hình notification settings

## 📱 Cách sử dụng

### 1. Device Token sẽ được log ra console khi app khởi động:
```
🔔 Initializing notifications...
✅ Notification registration successful!
📱 =================================
📱 DEVICE TOKEN INFORMATION
📱 =================================
📱 Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
📱 Platform: ios/android
📱 Device Type: Physical Device
📱 =================================
```

### 2. Khi đăng nhập thành công:
- Device token sẽ được gửi lên server endpoint: `PUT /api/users/{id}/device-token`
- Payload gửi lên server:
```json
{
  "deviceToken": "ExponentPushToken[...]"
}
```

### 3. Test notification:
- Có button "🔔 Test Notification" trong LoginScreen để test
- Sẽ gửi local notification test

## 🛠️ API Methods có sẵn

### NotificationService methods:
```javascript
// Lấy device token hiện tại
const token = notificationService.getDeviceToken();

// Log device token ra console với format đẹp
notificationService.logDeviceToken();

// Gửi device token lên server
await notificationService.sendDeviceTokenToServer(userId);

// Gửi local notification
await notificationService.sendLocalNotification(title, body, data);

// Gửi test notification
await notificationService.sendTestNotification();

// Lắng nghe notifications
const subscription = notificationService.addNotificationReceivedListener(callback);

// Xóa listener
notificationService.removeNotificationSubscription(subscription);

// Quản lý badge
await notificationService.setBadgeCount(5);
const count = await notificationService.getBadgeCount();

// Clear tất cả notifications
await notificationService.clearAllNotifications();
```

## 🔍 Debugging

### Kiểm tra console logs:
- `🔔 Initializing notifications...` - Bắt đầu khởi tạo
- `✅ Notification registration successful!` - Đăng ký thành công
- `📱 Device token for login: [token]` - Token khi login
- `📤 Sending device token to server...` - Gửi token lên server
- `✅ Device token sent to server successfully` - Gửi thành công

### Lỗi thường gặp:
- `❌ Must use physical device for Push Notifications` - Cần device thật
- `❌ Failed to get push token` - Không có permission
- `❌ No device token to send` - Chưa có token

## 🚀 Production Setup

### Cần làm thêm:
1. **Expo Project ID**: Thay `projectId` trong `notificationService.js`
2. **Server API**: Tạo endpoint `/api/notifications/register-device`
3. **Push Certificate**: Cấu hình iOS/Android push certificates
4. **FCM Setup**: Cấu hình Firebase Cloud Messaging cho Android

### Server endpoint cần tạo:
```javascript
PUT /api/users/{id}/device-token
Body: {
  deviceToken: string
}
```

## 📋 Test Checklist

- [ ] Device token được log ra console
- [ ] Permissions được request thành công
- [ ] Token được gửi lên server khi login
- [ ] Test notification hoạt động
- [ ] Notifications hiển thị khi app ở background
- [ ] Badge count hoạt động đúng
