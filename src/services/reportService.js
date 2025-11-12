import api from './api';

// Lấy top sản phẩm bán chạy
export const getTopSellingProducts = async () => {
  try {
    const response = await api.get('/reports/top-selling-products');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy top sản phẩm bán chạy:', error);
    throw error;
  }
};

// Lấy báo cáo doanh thu theo ngày
export const getDailyRevenue = async (date) => {
  try {
    const response = await api.get('/reports/daily-revenue', {
      params: { date }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo doanh thu ngày:', error);
    throw error;
  }
};

// Lấy báo cáo doanh thu thuần
export const getNetRevenue = async () => {
  try {
    const response = await api.get('/reports/net-revenue');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo doanh thu thuần:', error);
    throw error;
  }
};

// Lấy báo cáo doanh thu theo tháng
export const getMonthlyRevenue = async (year = new Date().getFullYear()) => {
  try {
    const response = await api.get('/reports/monthly-revenue', {
      params: { year }
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo doanh thu tháng:', error);
    throw error;
  }
};

// Lấy báo cáo công nợ khách hàng
export const getCustomerDebt = async () => {
  try {
    const response = await api.get('/reports/customer-debt');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo công nợ khách hàng:', error);
    throw error;
  }
};
