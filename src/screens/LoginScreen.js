import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Animated,
    Dimensions,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    Alert,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginAPI } from '../services/authService';
import notificationService from '../services/notificationService';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ onLoginSuccess = null }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));
    const [scaleAnim] = useState(new Animated.Value(0.8));
    const [boxAnim] = useState(new Animated.Value(0));
    const [truckAnim] = useState(new Animated.Value(0));
    const [chartAnim] = useState(new Animated.Value(0));
    const [warehouseAnim] = useState(new Animated.Value(0));
    const [packageAnim] = useState(new Animated.Value(0));

    // Animation cho các icon chuyển động
    useEffect(() => {
        loadSavedCredentials();

        // Animation chính cho form
        const mainAnimation = Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]);

        mainAnimation.start();

        // Animation cho các icon chuyển động liên tục
        const animations = [];

        const startIconAnimations = () => {
            // Hộp chuyển động ngang
            const boxAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(boxAnim, {
                        toValue: 1,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(boxAnim, {
                        toValue: 0,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                ])
            );
            animations.push(boxAnimation);
            boxAnimation.start();

            // Xe nâng chuyển động chéo
            const truckAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(truckAnim, {
                        toValue: 1,
                        duration: 4000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(truckAnim, {
                        toValue: 0,
                        duration: 4000,
                        useNativeDriver: true,
                    }),
                ])
            );
            animations.push(truckAnimation);
            truckAnimation.start();

            // Biểu đồ chuyển động dọc
            const chartAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(chartAnim, {
                        toValue: 1,
                        duration: 2500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(chartAnim, {
                        toValue: 0,
                        duration: 2500,
                        useNativeDriver: true,
                    }),
                ])
            );
            animations.push(chartAnimation);
            chartAnimation.start();

            // Kho bãi chuyển động ngang ngược
            const warehouseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(warehouseAnim, {
                        toValue: 1,
                        duration: 3500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(warehouseAnim, {
                        toValue: 0,
                        duration: 3500,
                        useNativeDriver: true,
                    }),
                ])
            );
            animations.push(warehouseAnimation);
            warehouseAnimation.start();

            // Package chuyển động dọc ngược
            const packageAnimation = Animated.loop(
                Animated.sequence([
                    Animated.timing(packageAnim, {
                        toValue: 1,
                        duration: 2800,
                        useNativeDriver: true,
                    }),
                    Animated.timing(packageAnim, {
                        toValue: 0,
                        duration: 2800,
                        useNativeDriver: true,
                    }),
                ])
            );
            animations.push(packageAnimation);
            packageAnimation.start();
        };

        // Delay một chút trước khi bắt đầu animation icon
        const timeoutId = setTimeout(startIconAnimations, 500);

        // Cleanup function
        return () => {
            clearTimeout(timeoutId);
            // Stop tất cả animations
            animations.forEach(animation => animation.stop());
            mainAnimation.stop();
        };
    }, []);

    // Khởi tạo notifications
    useEffect(() => {
        const initNotifications = async () => {
            try {
                await notificationService.registerForPushNotificationsAsync();
                console.log('✅ Notifications initialized successfully');
            } catch (error) {
                console.error('❌ Error initializing notifications:', error);
                // Không throw error để không crash app
            }
        };
        initNotifications();
    }, []);

    const loadSavedCredentials = async () => {
        try {
            const savedUsername = await AsyncStorage.getItem('savedUsername');
            const savedPassword = await AsyncStorage.getItem('savedPassword');
            const savedRememberMe = await AsyncStorage.getItem('rememberMe');

            if (savedRememberMe === 'true' && savedUsername) {
                setUsername(savedUsername);
                setRememberMe(true);
                if (savedPassword) {
                    setPassword(savedPassword);
                }
            }
        } catch (error) {
            console.error('Lỗi khi load thông tin đã lưu:', error);
        }
    };

    const saveCredentials = async () => {
        try {
            if (rememberMe) {
                await AsyncStorage.setItem('savedUsername', username);
                await AsyncStorage.setItem('savedPassword', password);
                await AsyncStorage.setItem('rememberMe', 'true');
            } else {
                await AsyncStorage.removeItem('savedUsername');
                await AsyncStorage.removeItem('savedPassword');
                await AsyncStorage.setItem('rememberMe', 'false');
            }
        } catch (error) {
            console.error('Lỗi khi lưu thông tin đăng nhập:', error);
        }
    };

    const handleLogin = async () => {
        if (!username.trim() || !password.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
            return;
        }

        setIsLoading(true);
        console.log('🔄 Bắt đầu đăng nhập...');
        
        try {
            const deviceToken = notificationService.getDeviceToken();
            console.log('📱 Device token:', deviceToken);
            
            const response = await loginAPI(username.trim(), password);
            console.log('✅ Đăng nhập API thành công:', response);
            
            // Gửi device token lên server (không bắt buộc)
            if (deviceToken && response.user?.id) {
                try {
                    const userId = response.user.id;
                    console.log('📤 Gửi device token cho user:', userId);
                    await notificationService.sendDeviceTokenToServer(userId);
                } catch (tokenError) {
                    console.warn('⚠️ Không thể gửi device token:', tokenError.message);
                    // Không fail login vì lỗi này
                }
            }

            // Lưu thông tin đăng nhập nếu người dùng chọn ghi nhớ
            try {
                await saveCredentials();
                console.log('💾 Đã lưu thông tin đăng nhập');
            } catch (saveError) {
                console.warn('⚠️ Không thể lưu thông tin:', saveError.message);
            }

            console.log(`🎉 Đăng nhập thành công: Chào mừng ${response.user?.fullName || 'User'}!`);
            
            if (onLoginSuccess) {
                onLoginSuccess();
            }
        } catch (error) {
            console.error('❌ Lỗi đăng nhập:', error);
            
            let errorMessage = 'Đã có lỗi xảy ra, vui lòng thử lại';
            
            if (error.message) {
                if (error.message.includes('Network')) {
                    errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại';
                } else if (error.message.includes('timeout')) {
                    errorMessage = 'Kết nối quá chậm. Vui lòng thử lại';
                } else {
                    errorMessage = error.message;
                }
            }
            
            Alert.alert('Đăng nhập thất bại', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Component render các icon chuyển động
    const AnimatedIcons = () => (
        <>
            {/* Hộp chuyển động ngang */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: height * 0.15,
                    transform: [{
                        translateX: boxAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-50, width - 30],
                        })
                    }],
                    opacity: 0.3,
                }}
            >
                <Ionicons name="cube-outline" size={24} color="#fff" />
            </Animated.View>

            {/* Xe nâng chuyển động chéo */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: height * 0.25,
                    right: 0,
                    transform: [{
                        translateY: truckAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, height * 0.1],
                        })
                    }, {
                        translateX: truckAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [40, -(width - 20)],
                        })
                    }],
                    opacity: 0.25,
                }}
            >
                <Ionicons name="car-outline" size={28} color="#fff" />
            </Animated.View>

            {/* Biểu đồ chuyển động dọc */}
            <Animated.View
                style={{
                    position: 'absolute',
                    left: width * 0.1,
                    top: height * 0.7,
                    transform: [{
                        translateY: chartAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -(height * 0.5)],
                        })
                    }],
                    opacity: 0.2,
                }}
            >
                <Ionicons name="bar-chart-outline" size={26} color="#fff" />
            </Animated.View>

            {/* Kho bãi chuyển động ngang ngược */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: height * 0.8,
                    right: 0,
                    transform: [{
                        translateX: warehouseAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, -(width - 30)],
                        })
                    }],
                    opacity: 0.3,
                }}
            >
                <Ionicons name="business-outline" size={30} color="#fff" />
            </Animated.View>

            {/* Package chuyển động dọc ngược */}
            <Animated.View
                style={{
                    position: 'absolute',
                    right: width * 0.1,
                    top: height * 0.2,
                    transform: [{
                        translateY: packageAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, height * 0.55],
                        })
                    }],
                    opacity: 0.25,
                }}
            >
                <Ionicons name="archive-outline" size={22} color="#fff" />
            </Animated.View>

            {/* Thêm một số icon nhỏ khác */}
            <Animated.View
                style={{
                    position: 'absolute',
                    top: height * 0.45,
                    left: 0,
                    transform: [{
                        translateX: boxAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [width + 20, -30],
                        })
                    }],
                    opacity: 0.2,
                }}
            >
                <Ionicons name="layers-outline" size={20} color="#fff" />
            </Animated.View>

            <Animated.View
                style={{
                    position: 'absolute',
                    top: height * 0.6,
                    right: 0,
                    transform: [{
                        translateX: chartAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [25, -(width - 25)],
                        })
                    }],
                    opacity: 0.15,
                }}
            >
                <Ionicons name="clipboard-outline" size={18} color="#fff" />
            </Animated.View>
        </>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#15803d', '#16a34a', '#22c55e']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>

                {/* Các icon chuyển động nền */}
                <AnimatedIcons />

                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }], width: '100%', maxWidth: 350 }}>

                    <View style={{ alignItems: 'center', marginBottom: 50 }}>
                        <Text style={{ fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 8 }}>
                            NL KHO
                        </Text>
                        <Text style={{ fontSize: 16, color: '#fff', textAlign: 'center', opacity: 1, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 }}>
                            Hệ thống quản lý kho thông minh
                        </Text>
                    </View>

                    <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 30, backdropFilter: 'blur(10px)', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 }}>

                        <View style={{ marginBottom: 20 }}>
                            <Text style={{ color: '#fff', fontSize: 16, marginBottom: 8, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}>Tên đăng nhập</Text>
                            <TextInput
                                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 15, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                                placeholder="Nhập tên đăng nhập"
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                value={username}
                                onChangeText={setUsername}
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={{ marginBottom: 30 }}>
                            <Text style={{ color: '#fff', fontSize: 16, marginBottom: 8, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}>Mật khẩu</Text>
                            <View style={{ position: 'relative' }}>
                                <TextInput
                                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 15, paddingRight: 50, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
                                    placeholder="Nhập mật khẩu"
                                    placeholderTextColor="rgba(255,255,255,0.7)"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                />
                                <TouchableOpacity
                                    style={{ position: 'absolute', right: 15, top: 15, padding: 2 }}
                                    onPress={() => setShowPassword(prev => !prev)}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        size={22}
                                        color="rgba(255,255,255,0.8)"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Checkbox Ghi nhớ đăng nhập */}
                        <TouchableOpacity
                            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}
                            onPress={() => setRememberMe(!rememberMe)}
                            activeOpacity={0.7}
                        >
                            <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: 'rgba(255,255,255,0.6)', backgroundColor: rememberMe ? 'rgba(255,255,255,0.8)' : 'transparent', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                {rememberMe && (
                                    <Ionicons name="checkmark" size={14} color="#16a34a" />
                                )}
                            </View>
                            <Text style={{ color: '#fff', fontSize: 14, opacity: 0.9 }}>
                                Ghi nhớ thông tin đăng nhập
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ backgroundColor: isLoading ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', opacity: isLoading ? 0.7 : 1 }}
                            onPress={isLoading ? null : handleLogin}
                            activeOpacity={0.8}
                            disabled={isLoading === true}
                        >
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}>
                                {isLoading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
                            </Text>
                        </TouchableOpacity>


                    </View>

                    <View style={{ alignItems: 'center', marginTop: 30 }}>
                        <Text style={{ color: '#fff', fontSize: 12, opacity: 0.8, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}>
                            © {new Date().getFullYear()} NLTECH.
                        </Text>
                    </View>
                </Animated.View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
