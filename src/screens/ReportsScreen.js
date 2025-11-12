import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { 
  getTopSellingProducts, 
  getDailyRevenue, 
  getNetRevenue, 
  getMonthlyRevenue, 
  getCustomerDebt 
} from '../services/reportService';

const ReportsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const [dailyRevenue, setDailyRevenue] = useState(null);
  const [netRevenue, setNetRevenue] = useState(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState(null);
  const [customerDebt, setCustomerDebt] = useState(null);

  useEffect(() => {
    loadAllReportData();
  }, []);

  const loadAllReportData = async () => {
    try {
      setLoading(true);
      
      // Load tất cả dữ liệu song song
      const [topProductsRes, dailyRes, netRes, monthlyRes, debtRes] = await Promise.all([
        getTopSellingProducts(),
        getDailyRevenue(),
        getNetRevenue(),
        getMonthlyRevenue(),
        getCustomerDebt()
      ]);
      
      if (topProductsRes.success) setTopProducts(topProductsRes.data);
      if (dailyRes.success) setDailyRevenue(dailyRes.data);
      if (netRes.success) setNetRevenue(netRes.data);
      if (monthlyRes.success) setMonthlyRevenue(monthlyRes.data);
      if (debtRes.success) setCustomerDebt(debtRes.data);
      
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllReportData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  // Tính tổng doanh thu tháng hiện tại
  const getCurrentMonthRevenue = () => {
    if (!monthlyRevenue?.monthlyData) return 0;
    const currentMonth = new Date().getMonth() + 1;
    const currentMonthData = monthlyRevenue.monthlyData.find(m => m.month === currentMonth);
    return currentMonthData?.revenue || 0;
  };

  // Lấy dữ liệu cho các cards
  const getCardData = () => {
    return {
      daily: dailyRevenue?.totalRevenue || 0,
      net: netRevenue?.netRevenue || 0,
      monthly: getCurrentMonthRevenue(),
      debt: customerDebt?.totalDebtAmount || 0
    };
  };

  const ReportCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={styles.reportCard} onPress={onPress}>
      <LinearGradient
        colors={[color, `${color}80`]}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardHeader}>
          <Ionicons name={icon} size={24} color="#fff" />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardValue}>{value}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const TopProductItem = ({ item, index }) => (
    <View style={styles.productItem}>
      <View style={styles.productRank}>
        <Text style={styles.rankNumber}>{index + 1}</Text>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.Product.name}
        </Text>
        <Text style={styles.productCode}>{item.Product.productCode}</Text>
        <View style={styles.productStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Số lượng bán:</Text>
            <Text style={styles.statValue}>{item.totalQuantity}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Doanh thu:</Text>
            <Text style={styles.statValue}>{formatCurrency(item.totalRevenue)}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderOverviewTab = () => {
    const cardData = getCardData();
    
    return (
      <View style={styles.tabContent}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        )}
        
        <View style={styles.cardsContainer}>
          <ReportCard
            title="Doanh thu hôm nay"
            value={formatCurrency(cardData.daily)}
            icon="today-outline"
            color="#4CAF50"
            onPress={() => navigation.navigate('DailyRevenue')}
          />
          <ReportCard
            title="Doanh thu thuần"
            value={formatCurrency(cardData.net)}
            icon="analytics-outline"
            color="#673AB7"
            onPress={() => navigation.navigate('NetRevenue')}
          />
          <ReportCard
            title="Doanh thu tháng"
            value={formatCurrency(cardData.monthly)}
            icon="stats-chart-outline"
            color="#FF9800"
            onPress={() => navigation.navigate('MonthlyRevenue')}
          />
          <ReportCard
            title="Công nợ KH"
            value={formatCurrency(cardData.debt)}
            icon="people-outline"
            color="#F44336"
            onPress={() => navigation.navigate('CustomerDebt')}
          />
        </View>
        
        {/* Thêm thông tin tóm tắt */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Tóm Tắt Nhanh</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Số khách hàng có nợ:</Text>
              <Text style={styles.summaryValue}>
                {customerDebt?.customerCount || 0}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tỷ lệ lợi nhuận thuần:</Text>
              <Text style={[
                styles.summaryValue,
                { color: (netRevenue?.profitMargin || 0) > 0 ? '#4CAF50' : '#F44336' }
              ]}>
                {(netRevenue?.profitMargin || 0).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Hóa đơn hôm nay:</Text>
              <Text style={styles.summaryValue}>
                {dailyRevenue?.invoiceCount || 0}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderTopProductsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Ionicons name="trophy-outline" size={24} color="#FF9800" />
        <Text style={styles.sectionTitle}>Top Sản Phẩm Bán Chạy</Text>
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : topProducts.length > 0 ? (
        <ScrollView style={styles.productsList}>
          {topProducts.map((item, index) => (
            <TopProductItem key={item.productId} item={item} index={index} />
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Chưa có dữ liệu báo cáo</Text>
        </View>
      )}
    </View>
  );

  const tabs = [
    { key: 'overview', title: 'Tổng quan', icon: 'grid-outline' },
    { key: 'products', title: 'Sản phẩm', icon: 'cube-outline' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Báo Cáo</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={20}
              color={activeTab === tab.key ? '#2196F3' : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText,
              ]}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'products' && renderTopProductsTab()}
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
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#2196F3',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reportCard: {
    width: '48%',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 15,
    minHeight: 100,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  cardValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
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
  productsList: {
    flex: 1,
  },
  productItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  rankNumber: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productCode: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 16,
    color: '#999',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  summarySection: {
    marginTop: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 15,
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
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default ReportsScreen;
