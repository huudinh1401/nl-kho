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
import { getMonthlyRevenue } from '../services/reportService';

const MonthlyRevenueScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    loadMonthlyRevenue();
  }, [currentYear]);

  const loadMonthlyRevenue = async () => {
    try {
      setLoading(true);
      const response = await getMonthlyRevenue(currentYear);
      if (response.success) {
        setRevenueData(response.data);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải báo cáo doanh thu tháng');
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

  const getMonthName = (month) => {
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];
    return months[month - 1];
  };

  const navigateYear = (direction) => {
    if (direction === 'prev') {
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentYear(currentYear + 1);
    }
  };

  const getTotalRevenue = () => {
    if (!revenueData?.monthlyData) return 0;
    return revenueData.monthlyData.reduce((total, month) => total + month.revenue, 0);
  };

  const getTotalProfit = () => {
    if (!revenueData?.monthlyData) return 0;
    return revenueData.monthlyData.reduce((total, month) => total + month.profit, 0);
  };

  const getTotalInvoices = () => {
    if (!revenueData?.monthlyData) return 0;
    return revenueData.monthlyData.reduce((total, month) => total + month.invoiceCount, 0);
  };

  const getTotalReturns = () => {
    if (!revenueData?.monthlyData) return 0;
    return revenueData.monthlyData.reduce((total, month) => total + month.returnAmount, 0);
  };

  const getBestMonth = () => {
    if (!revenueData?.monthlyData) return null;
    const bestMonth = revenueData.monthlyData.reduce((best, current) => 
      current.revenue > best.revenue ? current : best
    );
    return bestMonth.revenue > 0 ? bestMonth : null;
  };

  const StatCard = ({ title, value, icon, color, subtitle, change }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color, `${color}80`]}
        style={styles.statGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <Ionicons name={icon} size={24} color="#fff" />
          {change && (
            <View style={[styles.changeIndicator, { backgroundColor: change > 0 ? '#4CAF50' : '#F44336' }]}>
              <Ionicons 
                name={change > 0 ? 'trending-up' : 'trending-down'} 
                size={12} 
                color="#fff" 
              />
            </View>
          )}
        </View>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF9800', '#F57C00']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doanh Thu Tháng</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.yearNavigation}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateYear('prev')}
          >
            <Ionicons name="chevron-back" size={20} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.yearText}>
            Năm {currentYear}
          </Text>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateYear('next')}
          >
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF9800" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <StatCard
                title="Tổng Doanh Thu"
                value={formatCurrency(getTotalRevenue())}
                icon="cash-outline"
                color="#4CAF50"
                subtitle="Cả năm"
              />
              <StatCard
                title="Tổng Lợi Nhuận"
                value={formatCurrency(getTotalProfit())}
                icon="trending-up-outline"
                color="#2196F3"
                subtitle="Cả năm"
              />
              <StatCard
                title="Tổng Hóa Đơn"
                value={getTotalInvoices()}
                icon="receipt-outline"
                color="#9C27B0"
                subtitle="Cả năm"
              />
              <StatCard
                title="Hàng Trả Lại"
                value={formatCurrency(getTotalReturns())}
                icon="return-up-back-outline"
                color="#FF5722"
                subtitle="Cả năm"
              />
            </View>

            <View style={styles.summarySection}>
              <Text style={styles.sectionTitle}>Tóm Tắt Năm {currentYear}</Text>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tháng có doanh thu cao nhất:</Text>
                  <Text style={styles.summaryValue}>
                    {getBestMonth() ? getMonthName(getBestMonth().month) : 'Chưa có dữ liệu'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Doanh thu tháng đó:</Text>
                  <Text style={styles.summaryValue}>
                    {getBestMonth() ? formatCurrency(getBestMonth().revenue) : '0 đ'}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Tỷ lệ lợi nhuận:</Text>
                  <Text style={[
                    styles.summaryValue,
                    { color: getTotalRevenue() > 0 ? '#4CAF50' : '#F44336' }
                  ]}>
                    {getTotalRevenue() > 0 ? `${((getTotalProfit() / getTotalRevenue()) * 100).toFixed(1)}%` : '0%'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.monthlyListSection}>
              <Text style={styles.sectionTitle}>Chi Tiết Theo Tháng</Text>
              {revenueData?.monthlyData && revenueData.monthlyData.map((monthData, index) => (
                <View key={index} style={styles.monthCard}>
                  <View style={styles.monthHeader}>
                    <Text style={styles.monthName}>{getMonthName(monthData.month)}</Text>
                    <Text style={styles.monthRevenue}>{formatCurrency(monthData.revenue)}</Text>
                  </View>
                  
                  <View style={styles.monthDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Lợi nhuận:</Text>
                      <Text style={[styles.detailValue, { color: '#4CAF50' }]}>
                        {formatCurrency(monthData.profit)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Chi phí:</Text>
                      <Text style={[styles.detailValue, { color: '#F44336' }]}>
                        {formatCurrency(monthData.cost)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Hàng trả:</Text>
                      <Text style={[styles.detailValue, { color: '#FF9800' }]}>
                        {formatCurrency(monthData.returnAmount)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Số hóa đơn:</Text>
                      <Text style={styles.detailValue}>
                        {monthData.invoiceCount}
                      </Text>
                    </View>
                  </View>
                  
                  {monthData.revenue > 0 && (
                    <View style={styles.profitMarginBar}>
                      <View 
                        style={[
                          styles.profitMarginFill,
                          { 
                            width: `${(monthData.profit / monthData.revenue) * 100}%`,
                            backgroundColor: monthData.profit > 0 ? '#4CAF50' : '#F44336'
                          }
                        ]}
                      />
                      <Text style={styles.profitMarginText}>
                        {((monthData.profit / monthData.revenue) * 100).toFixed(1)}% lợi nhuận
                      </Text>
                    </View>
                  )}
                </View>
              ))}
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
  placeholder: {
    width: 40,
  },
  yearNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navButton: {
    padding: 8,
  },
  yearText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statGradient: {
    padding: 15,
    minHeight: 120,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  changeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statSubtitle: {
    color: '#fff',
    fontSize: 10,
    opacity: 0.8,
  },
  summarySection: {
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
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  monthlyListSection: {
    marginBottom: 20,
  },
  monthCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  monthName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  monthRevenue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  monthDetails: {
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  profitMarginBar: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  profitMarginFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 10,
  },
  profitMarginText: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default MonthlyRevenueScreen;
