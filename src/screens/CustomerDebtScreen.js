import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getCustomerDebt } from '../services/reportService';

const CustomerDebtScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [debtData, setDebtData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    loadCustomerDebt();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery, debtData]);

  const loadCustomerDebt = async () => {
    try {
      setLoading(true);
      const response = await getCustomerDebt();
      if (response.success) {
        setDebtData(response.data);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải báo cáo công nợ khách hàng');
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    if (!debtData?.customers || !Array.isArray(debtData.customers)) {
      setFilteredData([]);
      return;
    }
    
    if (!searchQuery.trim()) {
      setFilteredData(debtData.customers);
    } else {
      const filtered = debtData.customers.filter(item =>
        item.customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer.customerCode?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount || 0);
  };

  const getTotalDebt = () => {
    return debtData?.totalDebtAmount || 0;
  };

  const getOverdueDebt = () => {
    if (!debtData?.customers) return 0;
    const now = new Date();
    return debtData.customers.reduce((total, customer) => {
      const hasOverdueInvoice = customer.invoices.some(invoice => {
        const invoiceDate = new Date(invoice.createdAt);
        const daysDiff = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24));
        return daysDiff > 30; // Coi như quá hạn sau 30 ngày
      });
      return total + (hasOverdueInvoice ? customer.totalDebt : 0);
    }, 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getDaysOverdue = (dateString) => {
    const invoiceDate = new Date(dateString);
    const now = new Date();
    return Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (dateString) => {
    return getDaysOverdue(dateString) > 30;
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[color, `${color}80`]}
        style={styles.statGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon} size={24} color="#fff" />
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
        {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
      </LinearGradient>
    </View>
  );

  const CustomerDebtItem = ({ item }) => {
    const latestInvoice = item.invoices[0]; // Lấy hóa đơn mới nhất
    const customerIsOverdue = item.invoices.some(invoice => isOverdue(invoice.createdAt));
    
    return (
      <View style={styles.debtItem}>
        <View style={styles.customerInfo}>
          <View style={styles.customerHeader}>
            <Text style={styles.customerName} numberOfLines={2}>
              {item.customer.name || 'Khách hàng'}
            </Text>
            <Text style={[
              styles.debtAmount,
              { color: customerIsOverdue ? '#F44336' : '#FF9800' }
            ]}>
              {formatCurrency(item.totalDebt)}
            </Text>
          </View>
          
          <Text style={styles.customerCode}>{item.customer.customerCode || 'N/A'}</Text>
          
          {item.customer.phone && (
            <Text style={styles.customerPhone}>
              📞 {item.customer.phone}
            </Text>
          )}
          
          <View style={styles.debtDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số hóa đơn:</Text>
              <Text style={styles.detailValue}>{item.invoiceCount || 0}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hóa đơn mới nhất:</Text>
              <Text style={styles.detailValue}>
                {latestInvoice ? latestInvoice.invoiceCode : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ngày tạo:</Text>
              <Text style={styles.detailValue}>
                {latestInvoice ? formatDate(latestInvoice.createdAt) : 'N/A'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Số ngày quá hạn:</Text>
              <Text style={[
                styles.detailValue,
                { color: customerIsOverdue ? '#F44336' : '#4CAF50' }
              ]}>
                {latestInvoice ? Math.max(0, getDaysOverdue(latestInvoice.createdAt) - 30) : 0} ngày
              </Text>
            </View>
          </View>
          
          {/* Hiển thị danh sách hóa đơn */}
          <TouchableOpacity 
            style={styles.invoicesToggle}
            onPress={() => {/* Toggle hiển thị hóa đơn */}}
          >
            <Text style={styles.invoicesToggleText}>
              Xem {item.invoiceCount} hóa đơn
            </Text>
            <Ionicons name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
        </View>
        
        {customerIsOverdue && (
          <View style={styles.overdueIndicator}>
            <Ionicons name="warning" size={16} color="#F44336" />
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F44336', '#D32F2F']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Công Nợ Khách Hàng</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadCustomerDebt}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsContainer}>
          <StatCard
            title="Tổng Công Nợ"
            value={formatCurrency(getTotalDebt())}
            icon="wallet-outline"
            color="#FF9800"
            subtitle={`${debtData?.customerCount || 0} khách hàng`}
          />
          <StatCard
            title="Quá Hạn"
            value={formatCurrency(getOverdueDebt())}
            icon="time-outline"
            color="#F44336"
            subtitle="Cần thu hồi"
          />
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm khách hàng..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F44336" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : filteredData.length > 0 ? (
          <ScrollView style={styles.debtList}>
            <Text style={styles.listHeader}>
              Danh sách công nợ ({filteredData.length} khách hàng)
            </Text>
            {filteredData.map((item, index) => (
              <CustomerDebtItem key={index} item={item} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#4CAF50" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Không tìm thấy khách hàng' : 'Không có công nợ'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Tất cả khách hàng đã thanh toán'}
            </Text>
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    padding: 20,
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
    minHeight: 100,
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
  searchContainer: {
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
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
  debtList: {
    flex: 1,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  debtItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerInfo: {
    flex: 1,
  },
  customerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  debtAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerCode: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  customerPhone: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  debtDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 12,
    color: '#888',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  overdueIndicator: {
    marginLeft: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptySubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  invoicesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  invoicesToggleText: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default CustomerDebtScreen;
