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
import { getDailyRevenue } from '../services/reportService';

const DailyRevenueScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [revenueData, setRevenueData] = useState(null);

  useEffect(() => {
    loadDailyRevenue();
  }, [selectedDate]);

  const loadDailyRevenue = async () => {
    try {
      setLoading(true);
      const response = await getDailyRevenue(selectedDate);
      if (response.success) {
        setRevenueData(response.data);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải báo cáo doanh thu ngày');
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const StatCard = ({ title, value, icon, color }) => (
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
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#45a049']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Doanh Thu Ngày</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <StatCard
              title="Tổng Doanh Thu"
              value={formatCurrency(revenueData?.totalRevenue)}
              icon="cash-outline"
              color="#4CAF50"
            />
            <StatCard
              title="Đã Thanh Toán"
              value={formatCurrency(revenueData?.totalPaid)}
              icon="card-outline"
              color="#2196F3"
            />
            <StatCard
              title="Số Hóa Đơn"
              value={revenueData?.invoiceCount || 0}
              icon="receipt-outline"
              color="#FF9800"
            />
            <StatCard
              title="Còn Nợ"
              value={formatCurrency((revenueData?.totalRevenue || 0) - (revenueData?.totalPaid || 0))}
              icon="time-outline"
              color="#F44336"
            />
          </View>
        )}

        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Danh Sách Hóa Đơn</Text>
          {revenueData?.invoices && revenueData.invoices.length > 0 ? (
            revenueData.invoices.map((invoice, index) => (
              <View key={index} style={styles.invoiceCard}>
                <View style={styles.invoiceHeader}>
                  <Text style={styles.invoiceCode}>{invoice.invoiceCode}</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: invoice.status === 'completed' ? '#4CAF50' : '#FF9800' }
                  ]}>
                    <Text style={styles.statusText}>
                      {invoice.status === 'completed' ? 'Đã thanh toán' : 'Chưa hoàn thành'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.customerName}>{invoice.customerName}</Text>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Tổng tiền:</Text>
                  <Text style={styles.amountValue}>{formatCurrency(invoice.totalAmount)}</Text>
                </View>
                <View style={styles.amountRow}>
                  <Text style={styles.amountLabel}>Đã thanh toán:</Text>
                  <Text style={[styles.amountValue, { color: '#4CAF50' }]}>
                    {formatCurrency(invoice.paidAmount)}
                  </Text>
                </View>
                {invoice.totalAmount !== invoice.paidAmount && (
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Còn nợ:</Text>
                    <Text style={[styles.amountValue, { color: '#F44336' }]}>
                      {formatCurrency(invoice.totalAmount - invoice.paidAmount)}
                    </Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.detailCard}>
              <Text style={styles.detailText}>
                Chưa có hóa đơn nào trong ngày hôm nay
              </Text>
            </View>
          )}
        </View>
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
    marginBottom: 10,
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
  dateText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
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
  detailsSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  detailCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  detailText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  invoiceCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoiceCode: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  customerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  amountLabel: {
    fontSize: 13,
    color: '#888',
  },
  amountValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
});

export default DailyRevenueScreen;
