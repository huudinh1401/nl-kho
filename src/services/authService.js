import api, { saveLoginData } from './api';

// API đăng nhập
export const loginAPI = async (username, password) => {
  try {
    const response = await api.post('/auth/login', {
      username,
      password
    });
    
    // Lưu thông tin đăng nhập
    await saveLoginData(response.data);
    
    return response.data;
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    throw error;
  }
};

// API lấy thông tin profile
export const getProfileAPI = async () => {
  try {
    const response = await api.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Lỗi lấy thông tin profile:', error);
    throw error;
  }
};

// API đổi mật khẩu
export const changePasswordAPI = async (oldPassword, newPassword) => {
  try {
    const response = await api.post('/auth/change-password', {
      oldPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Lỗi đổi mật khẩu:', error);
    throw error;
  }
};
