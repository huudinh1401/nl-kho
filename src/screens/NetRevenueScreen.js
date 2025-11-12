import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getNetRevenue } from '../services/reportService';

const NetRevenueScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    loadNetRevenue();
  }, []);

  const loadNetRevenue = async () => {
    try {
      setLoading(true);
      const response = await getNetRevenue();
      if (response.success) {
        setRevenueData(response.data);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải báo cáo doanh thu thuần');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  const StatCard = ({ title, value, icon, color, subtitle, isPercentage = false }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color, `${color}80`]}
        style={styles.statGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={24} color="#fff" />
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>
          {isPercentage ? formatPercentage(value) : formatCurrency(value)}
        </Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );

  const SummaryCard = ({ title, amount, color, icon }) => (
    <View style={styles.summaryCard}>
      <View style={styles.summaryHeader}>
        <Ionicons name={icon} size={20} color={color} />
        <Text style={styles.summaryTitle}>{title}</Text>
      </View>
      <Text style={[styles.summaryAmount, { color }]}>
        {formatCurrency(amount)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#673AB7', '#512DA8']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doanh Thu Thuần</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadNetRevenue}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.periodInfo}>
          <Text style={styles.periodText}>
            {revenueData?.period?.startDate} - {revenueData?.period?.endDate}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#673AB7" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            {/* Main Stats */}
            <View style={styles.statsContainer}>
              <StatCard
                title="Doanh Thu Thuần"
                value={revenueData?.netRevenue}
                icon="trending-up-outline"
                color="#4CAF50"
                subtitle="Lợi nhuận thực tế"
              />
              <StatCard
                title="Tỷ Suất Lợi Nhuận"
                value={revenueData?.profitMargin}
                icon="pie-chart-outline"
                color="#FF9800"
                subtitle="Hiệu quả kinh doanh"
                isPercentage={true}
              />
            </View>

            {/* Revenue Breakdown */}
            <View style={styles.breakdownSection}>
              <Text style={styles.sectionTitle}>Chi Tiết Doanh Thu</Text>
              
              <SummaryCard
                title="Tổng Doanh Thu"
                amount={revenueData?.totalRevenue}
                color="#2196F3"
                icon="cash-outline"
              />
              
              <SummaryCard
                title="Tổng Chi Phí"
                amount={revenueData?.totalCost}
                color="#F44336"
                icon="remove-circle-outline"
              />
              
              <SummaryCard
                title="Hàng Trả Lại"
                amount={revenueData?.totalReturns}
                color="#FF9800"
                icon="return-up-back-outline"
              />
              
              <View style={styles.netRevenueCard}>
                <LinearGradient
                  colors={['#4CAF50', '#45a049']}
                  style={styles.netRevenueGradient}
                >
                  <View style={styles.netRevenueHeader}>
                    <Ionicons name="checkmark-circle" size={24} color="#fff" />
                    <Text style={styles.netRevenueTitle}>Doanh Thu Thuần</Text>
                  </View>
                  <Text style={styles.netRevenueAmount}>
                    {formatCurrency(revenueData?.netRevenue)}
                  </Text>
                  <Text style={styles.netRevenueSubtitle}>
                    Tỷ suất: {formatPercentage(revenueData?.profitMargin)}
                  </Text>
                </LinearGradient>
              </View>
            </View>

            {/* Analysis Section */}
            <View style={styles.analysisSection}>
              <Text style={styles.sectionTitle}>Phân Tích</Text>
              <View style={styles.analysisCard}>
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Hiệu quả kinh doanh:</Text>
                  <Text style={[
                    styles.analysisValue,
                    { color: (revenueData?.profitMargin || 0) > 20 ? '#4CAF50' : '#FF9800' }
                  ]}>
                    {(revenueData?.profitMargin || 0) > 20 ? 'Tốt' : 'Trung bình'}
                  </Text>
                </View>
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Tỷ lệ chi phí:</Text>
                  <Text style={styles.analysisValue}>
                    {formatPercentage(
                      revenueData?.totalRevenue > 0 
                        ? (revenueData.totalCost / revenueData.totalRevenue) * 100 
                        : 0
                    )}
                  </Text>
                </View>
                <View style={styles.analysisRow}>
                  <Text style={styles.analysisLabel}>Tỷ lệ trả hàng:</Text>
                  <Text style={styles.analysisValue}>
                    {formatPercentage(
                      revenueData?.totalRevenue > 0 
                        ? (revenueData.totalReturns / revenueData.totalRevenue) * 100 
                        : 0
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
  },
  periodInfo: {
    alignItems: 'center',
  },
  periodText: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statGradient: {
    padding: 15,
    alignItems: 'center',
    minHeight: 120,
  },
  statTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  statSubtitle: {
    color: '#fff',
    fontSize: 10,
    marginTop: 2,
    opacity: 0.8,
    textAlign: 'center',
  },
  breakdownSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  netRevenueCard: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  netRevenueGradient: {
    padding: 20,
    alignItems: 'center',
  },
  netRevenueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  netRevenueTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  netRevenueAmount: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  netRevenueSubtitle: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.9,
  },
  analysisSection: {
    marginBottom: 20,
  },
  analysisCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  analysisLabel: {
    fontSize: 14,
    color: '#666',
  },
  analysisValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

export default NetRevenueScreen;
