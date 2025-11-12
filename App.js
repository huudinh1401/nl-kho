import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [showTest, setShowTest] = useState(false);
  
  // Test component để kiểm tra
  if (showTest) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#16a34a' }}>
        <Text style={{ color: 'white', fontSize: 24, marginBottom: 20 }}>
          NL KHO - Test Mode
        </Text>
        <TouchableOpacity 
          onPress={() => setShowTest(false)}
          style={{ backgroundColor: 'white', padding: 15, borderRadius: 10 }}
        >
          <Text style={{ color: '#16a34a', fontWeight: 'bold' }}>Vào App</Text>
        </TouchableOpacity>
      </View>
    );
  }

  try {
    return <AppNavigator />;
  } catch (error) {
    console.error('App Error:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#dc2626' }}>
        <Text style={{ color: 'white', fontSize: 18, textAlign: 'center', padding: 20 }}>
          Lỗi: {error.message}
        </Text>
        <TouchableOpacity 
          onPress={() => setShowTest(true)}
          style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, marginTop: 20 }}
        >
          <Text style={{ color: '#dc2626', fontWeight: 'bold' }}>Test Mode</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
