import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLogoutCallback } from './navigationService';

const api = axios.create({
  baseURL: 'https://apikho.nguyenluan.vn/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 giây timeout
});

// Interceptor để thêm token vào tất cả các request
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response và lỗi
api.interceptors.response.use(
  (response) => {
    // Trả về data thành công
    return response;
  },
  async (error) => {
    // Kiểm tra nếu gặp lỗi 401 (Unauthorized) hoặc 403 (Forbidden)
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.log('Token hết hạn hoặc không hợp lệ, đăng xuất người dùng');

      // Xóa tất cả dữ liệu người dùng
      await AsyncStorage.multiRemove([
        'accessToken',
        'userInfo',
        'userId',
        'userRole'
      ]);

      // Trigger logout callback để chuyển về màn hình đăng nhập
      const logoutCallback = getLogoutCallback();
      if (logoutCallback) {
        logoutCallback();
      }

      return Promise.reject(new Error('Token hết hạn, vui lòng đăng nhập lại'));
    }

    // Xử lý các lỗi khác
    if (error.response) {
      // Server trả về lỗi với status code
      console.error('API Error:', error.response.status, error.response.data);
      return Promise.reject(error.response.data || error);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('Network Error:', error.request);
      return Promise.reject(new Error('Lỗi kết nối mạng, vui lòng thử lại'));
    } else {
      // Lỗi khác
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

// Hàm helper để lưu thông tin đăng nhập
export const saveLoginData = async (loginResponse) => {
  try {
    const { user, token } = loginResponse;

    // Lưu token
    await AsyncStorage.setItem('accessToken', token);

    // Lưu thông tin user
    await AsyncStorage.setItem('userInfo', JSON.stringify(user));
    await AsyncStorage.setItem('userId', user.id.toString());
    await AsyncStorage.setItem('userRole', user.role);

    console.log('Đã lưu thông tin đăng nhập thành công');
  } catch (error) {
    console.error('Lỗi khi lưu thông tin đăng nhập:', error);
    throw error;
  }
};

// Hàm helper để lấy thông tin user từ AsyncStorage
export const getUserInfo = async () => {
  try {
    const userInfo = await AsyncStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('Lỗi khi lấy thông tin user:', error);
    return null;
  }
};

// Hàm gọi API để lấy thông tin user từ server
export const fetchUserProfile = async () => {
  try {
    console.log('🔄 Đang lấy thông tin user...');
    const response = await api.get('/auth/me');

    // Cập nhật thông tin user trong AsyncStorage
    if (response.data && response.data.success) {
      await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.data || response.data.user));
      console.log('✅ Cập nhật thông tin user thành công');
    }

    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy thông tin user:', error.message);
    throw error;
  }
};

// Hàm helper để kiểm tra đã đăng nhập chưa
export const isLoggedIn = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    return !!token;
  } catch (error) {
    console.error('Lỗi khi kiểm tra trạng thái đăng nhập:', error);
    return false;
  }
};

// Hàm logout
export const logout = async () => {
  try {
    await AsyncStorage.multiRemove([
      'accessToken',
      'userInfo',
      'userId',
      'userRole'
    ]);
    console.log('Đăng xuất thành công');
  } catch (error) {
    console.error('Lỗi khi đăng xuất:', error);
  }
};

// Hàm lấy danh sách phiếu nhập
export const getImports = async () => {
  try {
    const response = await api.get('/imports');
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy phiếu nhập:', error.message);
    throw error;
  }
};

// Hàm lấy chi tiết phiếu nhập theo ID
export const getImportDetail = async (importId) => {
  try {
    const response = await api.get(`/imports/${importId}`);
    console.log('📥 Chi tiết phiếu nhập:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hàm lấy chi tiết phiếu xuất theo ID
export const getInvoiceDetail = async (invoiceId) => {
  try {
    const response = await api.get(`/invoices/${invoiceId}`);
    console.log('📤 Chi tiết phiếu xuất:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hàm lấy chi tiết phiếu trả hàng theo ID
export const getReturnDetail = async (returnId) => {
  try {
    const response = await api.get(`/returns/${returnId}`);
    console.log('🔄 Chi tiết phiếu trả hàng:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hàm duyệt phiếu nhập
export const approveImport = async (importId) => {
  try {
    // console.log('🔄 Đang duyệt phiếu nhập ID:', importId);

    const response = await api.put(`/imports/${importId}/approve`);

    // console.log('✅ Duyệt phiếu nhập thành công!');

    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi duyệt phiếu nhập:', error.message);
    throw error;
  }
};

// Hàm lấy danh sách phiếu xuất
export const getInvoices = async () => {
  try {
    const response = await api.get('/invoices');
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy phiếu xuất:', error.message);
    throw error;
  }
};

// Hàm duyệt phiếu xuất
export const approveInvoice = async (invoiceId) => {
  try {
    // console.log('🔄 Đang duyệt phiếu xuất ID:', invoiceId);

    const response = await api.post(`/invoices/${invoiceId}/approve`);

    // console.log('✅ Duyệt phiếu xuất thành công!');

    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi duyệt phiếu xuất:', error.message);
    throw error;
  }
};

// Hàm lấy danh sách phiếu trả hàng
export const getReturns = async () => {
  try {
    const response = await api.get('/returns');
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy phiếu trả hàng:', error.message);
    throw error;
  }
};

// Hàm duyệt phiếu trả hàng
export const approveReturn = async (returnId) => {
  try {
    console.log('🔄 Đang duyệt phiếu trả hàng ID:', returnId);

    const response = await api.post(`/returns/${returnId}/approve`);

    console.log('✅ Duyệt phiếu trả hàng thành công!');

    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi duyệt phiếu trả hàng:', error.message);
    throw error;
  }
};

// Hàm lấy tổng số phiếu cần duyệt
export const getPendingDocumentsCount = async () => {
  try {
    // Gọi cả 3 API song song
    const [importsResult, invoicesResult, returnsResult] = await Promise.all([
      getImports().catch(() => []),
      getInvoices().catch(() => []),
      getReturns().catch(() => [])
    ]);

    // Xử lý phiếu nhập
    const importsArray = Array.isArray(importsResult)
      ? importsResult
      : importsResult.data || [];
    const pendingImportsCount = importsArray.filter(doc => doc.status === 'pending').length;

    // Xử lý phiếu xuất
    const invoicesArray = Array.isArray(invoicesResult)
      ? invoicesResult
      : invoicesResult.data || [];
    const pendingInvoicesCount = invoicesArray.filter(doc => doc.status === 'pending').length;

    // Xử lý phiếu trả hàng
    const returnsArray = Array.isArray(returnsResult)
      ? returnsResult
      : returnsResult.data || [];
    const pendingReturnsCount = returnsArray.filter(doc => doc.status === 'pending').length;

    // Tổng số phiếu cần duyệt
    const totalPendingCount = pendingImportsCount + pendingInvoicesCount + pendingReturnsCount;

    return totalPendingCount;
  } catch (error) {
    console.error('❌ Lỗi khi lấy số phiếu cần duyệt:', error.message);
    return 0; // Trả về 0 nếu có lỗi
  }
};

export default api;
