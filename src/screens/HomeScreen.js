import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getUserInfo, fetchUserProfile, logout } from '../services/api';

const HomeScreen = ({ onLogout = null, navigation }) => {
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        loadUserInfo();
    }, []);

    const loadUserInfo = async () => {
        try {
            // Lấy thông tin user từ AsyncStorage trước (để hiển thị nhanh)
            const cachedUser = await getUserInfo();
            if (cachedUser) {
                setUserInfo(cachedUser);
                console.log('📱 Cached user info:', cachedUser);
            }

            // Sau đó gọi API để lấy thông tin mới nhất
            const apiResponse = await fetchUserProfile();
            if (apiResponse && apiResponse.success) {
                const userData = apiResponse.data || apiResponse.user;
                setUserInfo(userData);
                console.log('🔄 Updated user info from API:', userData);
            }
        } catch (error) {
            console.error('❌ Lỗi khi lấy thông tin user:', error);
            // Nếu API lỗi, vẫn hiển thị thông tin cached
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                        if (onLogout) {
                            onLogout();
                        }
                    }
                }
            ]
        );
    };


    const handleApproveDocuments = () => {
        if (navigation) {
            navigation.navigate('ApproveDocuments');
        } else {
            Alert.alert('Thông báo', 'Đang chuyển đến màn hình duyệt phiếu...');
        }
    };

    const menuItems = [
        { id: 1, title: 'Quản lý sản phẩm', icon: 'cube-outline', color: '#3b82f6' },
        { id: 2, title: 'Duyệt phiếu', icon: 'checkmark-circle-outline', color: '#10b981' },
        { id: 5, title: 'Báo cáo', icon: 'document-text-outline', color: '#ef4444' },
        { id: 6, title: 'Cài đặt', icon: 'settings-outline', color: '#6b7280' },
    ];

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#15803d', '#16a34a', '#22c55e']} style={{ flex: 1 }}>
                
                {/* Header */}
                <View style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}>
                                NL KHO
                            </Text>
                            <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9, marginTop: 2 }}>
                                Chào mừng, {userInfo?.fullName || 'User'}
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={handleLogout}
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25, padding: 8 }}
                        >
                            <Ionicons name="log-out-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc', borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
                    <View style={{ padding: 20 }}>
                        
                        {/* User Info Card */}
                        <View style={{ backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 10 }}>
                                Thông tin tài khoản
                            </Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Ionicons name="person-outline" size={20} color="#6b7280" />
                                <Text style={{ marginLeft: 10, fontSize: 16, color: '#374151' }}>
                                    {userInfo?.fullName || 'N/A'}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Ionicons name="mail-outline" size={20} color="#6b7280" />
                                <Text style={{ marginLeft: 10, fontSize: 16, color: '#374151' }}>
                                    {userInfo?.email || 'N/A'}
                                </Text>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="shield-checkmark-outline" size={20} color="#6b7280" />
                                <Text style={{ marginLeft: 10, fontSize: 16, color: '#374151', textTransform: 'capitalize' }}>
                                    {userInfo?.role || 'N/A'}
                                </Text>
                            </View>
                        </View>

                        {/* Menu Grid */}
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15 }}>
                            Chức năng chính
                        </Text>
                        
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                            {menuItems.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={{ width: '48%', backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 }}
                                    onPress={() => {
                                        if (item.id === 5) { // Báo cáo
                                            if (navigation) {
                                                navigation.navigate('Reports');
                                            } else {
                                                Alert.alert('Thông báo', 'Đang chuyển đến màn hình báo cáo...');
                                            }
                                        } else if (item.id === 2) { // Duyệt phiếu
                                            handleApproveDocuments();
                                        } else {
                                            Alert.alert('Thông báo', `Chức năng "${item.title}" đang được phát triển`);
                                        }
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={{ backgroundColor: item.color, borderRadius: 30, padding: 15, marginBottom: 10 }}>
                                        <Ionicons name={item.icon} size={30} color="#fff" />
                                    </View>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', textAlign: 'center' }}>
                                        {item.title}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    );
};

export default HomeScreen;
