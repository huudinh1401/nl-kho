import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ReportsScreen from '../screens/ReportsScreen';
import DailyRevenueScreen from '../screens/DailyRevenueScreen';
import NetRevenueScreen from '../screens/NetRevenueScreen';
import MonthlyRevenueScreen from '../screens/MonthlyRevenueScreen';
import CustomerDebtScreen from '../screens/CustomerDebtScreen';

const Stack = createStackNavigator();

const ReportNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f5f5f5' },
      }}
    >
      <Stack.Screen name="ReportsMain" component={ReportsScreen} />
      <Stack.Screen name="DailyRevenue" component={DailyRevenueScreen} />
      <Stack.Screen name="NetRevenue" component={NetRevenueScreen} />
      <Stack.Screen name="MonthlyRevenue" component={MonthlyRevenueScreen} />
      <Stack.Screen name="CustomerDebt" component={CustomerDebtScreen} />
    </Stack.Navigator>
  );
};

export default ReportNavigator;
