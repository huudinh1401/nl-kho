import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ApproveDocumentsScreen from '../screens/ApproveDocumentsScreen';
import ReportNavigator from './ReportNavigator';
import { setLogoutCallback } from '../services/navigationService';

const Stack = createStackNavigator();

const AppNavigator = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Sử dụng boolean
    const [isLoading, setIsLoading] = useState(true); // Thêm loading state

    // Kiểm tra trạng thái đăng nhập khi khởi động
    useEffect(() => {
        checkAuthStatus();
        
        // Đăng ký logout callback
        setLogoutCallback(() => {
            setIsAuthenticated(false);
        });
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('accessToken');
            setIsAuthenticated(!!token);
        } catch (error) {
            console.error('Lỗi kiểm tra trạng thái đăng nhập:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.multiRemove([
                'accessToken',
                'userInfo', 
                'userId',
                'userRole'
            ]);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
        }
    };

    const AuthenticatedStack = () => (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                cardStyle: { backgroundColor: '#f5f5f5' },
            }}
        >
            <Stack.Screen name="Home">
                {(props) => <HomeScreen {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen name="ApproveDocuments" component={ApproveDocumentsScreen} />
            <Stack.Screen name="Reports" component={ReportNavigator} />
        </Stack.Navigator>
    );

    // Loading screen
    if (isLoading) {
        return (
            <LinearGradient colors={['#15803d', '#16a34a', '#22c55e']} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={{ color: '#fff', marginTop: 20, fontSize: 16 }}>Đang khởi động...</Text>
            </LinearGradient>
        );
    }

    return (
        <NavigationContainer>
            {isAuthenticated ? (
                <AuthenticatedStack />
            ) : (
                <LoginScreen onLoginSuccess={handleLoginSuccess} />
            )}
        </NavigationContainer>
    );
};

export default AppNavigator;
