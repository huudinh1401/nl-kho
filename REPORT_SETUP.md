# Hướng Dẫn Sử Dụng Màn Hình Báo Cáo

## 🎯 Tính Năng Đã Hoàn Thành

### ✅ Màn Hình Báo Cáo Chính (`ReportsScreen.js`)
- **Tab Tổng Quan**: 4 card báo cáo chính
  - Doanh thu hôm nay
  - Doanh thu tuần  
  - Doanh thu tháng
  - Công nợ khách hàng
- **Tab Sản Phẩm**: Top sản phẩm bán chạy từ API `/api/reports/top-selling-products`

### ✅ Các Màn Hình Báo Cáo Chi Tiết
1. **`DailyRevenueScreen.js`** - Báo cáo doanh thu theo ngày
2. **`WeeklyRevenueScreen.js`** - Báo cáo doanh thu theo tuần (có điều hướng tuần)
3. **`MonthlyRevenueScreen.js`** - Báo cáo doanh thu theo tháng (có điều hướng tháng)
4. **`CustomerDebtScreen.js`** - Báo cáo công nợ khách hàng (có tìm kiếm)

### ✅ Navigation & Services
- **`ReportNavigator.js`** - Stack navigator cho các màn hình báo cáo
- **`reportService.js`** - Service gọi API với fallback mock data
- **`mockReportData.js`** - Dữ liệu demo để test

## 🚀 Cách Sử Dụng

### 1. Chạy Ứng Dụng
```bash
npm start
# hoặc
expo start
```

### 2. Test Màn Hình Báo Cáo
1. **Đăng nhập** vào ứng dụng
2. Trên màn hình Home, **bấm nút "Báo cáo"** (màu đỏ)
3. Ứng dụng sẽ chuyển đến màn hình báo cáo với 2 tab:
   - **Tổng quan**: Các card báo cáo chính
   - **Sản phẩm**: Top sản phẩm bán chạy

### 3. Điều Hướng
- **Từ Tab Tổng Quan**: Bấm vào các card để xem báo cáo chi tiết
- **Navigation**: Sử dụng nút back để quay lại
- **Pull to Refresh**: Vuốt xuống để làm mới dữ liệu

## 🔧 Cấu Hình API

### Hiện Tại
- Service sử dụng **mock data** khi API không khả dụng
- Tự động fallback khi có lỗi API

### Khi API Sẵn Sàng
Các endpoint cần implement:
```
GET /api/reports/top-selling-products
GET /api/reports/daily-revenue?date=YYYY-MM-DD
GET /api/reports/weekly-revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
GET /api/reports/monthly-revenue?month=MM&year=YYYY
GET /api/reports/customer-debt
```

## 🎨 Thiết Kế

### Màu Sắc Chủ Đạo
- **Doanh thu ngày**: Xanh lá (#4CAF50)
- **Doanh thu tuần**: Xanh dương (#2196F3)  
- **Doanh thu tháng**: Cam (#FF9800)
- **Công nợ**: Đỏ (#F44336)

### Tính Năng UI/UX
- **Gradient backgrounds** đẹp mắt
- **Loading states** và **empty states**
- **Pull-to-refresh** 
- **Search functionality** (màn hình công nợ)
- **Navigation controls** (tuần/tháng)

## 📱 Test Cases

### ✅ Đã Test
- [x] Navigation từ Home → Reports
- [x] Hiển thị mock data
- [x] Tab switching (Tổng quan ↔ Sản phẩm)
- [x] Loading states
- [x] Error handling với fallback data

### 🔄 Cần Test Khi API Sẵn Sàng
- [ ] Kết nối API thực tế
- [ ] Xử lý lỗi API
- [ ] Performance với dữ liệu lớn
- [ ] Refresh data

## 🐛 Troubleshooting

### Lỗi Navigation
Đảm bảo React Navigation được cài đặt đúng:
```bash
npm install @react-navigation/native @react-navigation/stack
```

### Lỗi Mock Data
Kiểm tra file `mockReportData.js` có đúng format không

### Lỗi API
Service tự động fallback về mock data khi API lỗi

## 📋 TODO

- [ ] Thêm biểu đồ (charts) cho các báo cáo
- [ ] Export báo cáo PDF/Excel
- [ ] Filter theo ngày tháng
- [ ] Push notifications cho báo cáo
- [ ] Offline support
- [ ] Dark mode support
