import React from 'react';
import {
    View,
    Text,
    Modal,
    ScrollView,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DocumentDetailModal = ({ visible, onClose, document }) => {
    if (!document) return null;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(parseFloat(amount || 0));
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        
        try {
            const date = new Date(dateString);
            
            // Kiểm tra xem date có hợp lệ không
            if (isNaN(date.getTime())) {
                console.log('❌ Ngày không hợp lệ:', dateString);
                return 'Ngày không hợp lệ';
            }
            
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.log('❌ Lỗi format ngày:', error, 'Input:', dateString);
            return 'Lỗi định dạng ngày';
        }
    };

    const getDocumentInfo = () => {
        console.log('🔍 Document data trong modal:', JSON.stringify(document, null, 2));
        
        if (document.documentType === 'import') {
            console.log('📅 Import date:', document.importDate);
            console.log('📅 Created at:', document.createdAt);
            return {
                title: 'Chi Tiết Phiếu Nhập',
                code: document.importCode || 'N/A',
                date: document.importDate || document.createdAt,
                partner: document.Supplier?.name || 'N/A',
                partnerLabel: 'Nhà cung cấp',
                partnerCode: document.Supplier?.supplierCode || 'N/A',
                partnerPhone: document.Supplier?.phone || 'N/A',
                partnerAddress: document.Supplier?.address || 'N/A',
                user: document.User?.fullName || 'N/A',
                note: document.note || 'Không có ghi chú',
                items: document.ImportItems || [],
                color: '#10b981'
            };
        } else if (document.documentType === 'invoice') {
            console.log('📅 Invoice date:', document.invoiceDate);
            console.log('📅 Created at:', document.createdAt);
            return {
                title: 'Chi Tiết Phiếu Xuất',
                code: document.invoiceCode || 'N/A',
                date: document.invoiceDate || document.createdAt,
                partner: document.Customer?.name || 'N/A',
                partnerLabel: 'Khách hàng',
                partnerCode: document.Customer?.customerCode || 'N/A',
                partnerPhone: document.Customer?.phone || 'N/A',
                partnerAddress: document.Customer?.address || 'N/A',
                user: document.User?.fullName || 'N/A',
                note: document.note || 'Không có ghi chú',
                items: document.InvoiceItems || [],
                color: '#f59e0b'
            };
        } else {
            console.log('📅 Return created at:', document.createdAt);
            console.log('📅 Return date:', document.returnDate);
            return {
                title: 'Chi Tiết Phiếu Trả Hàng',
                code: document.returnCode || 'N/A',
                date: document.returnDate || document.createdAt,
                partner: document.Supplier?.name || document.Customer?.name || 'N/A',
                partnerLabel: 'Đối tác',
                partnerCode: document.Supplier?.supplierCode || document.Customer?.customerCode || 'N/A',
                partnerPhone: document.Supplier?.phone || document.Customer?.phone || 'N/A',
                partnerAddress: document.Supplier?.address || document.Customer?.address || 'N/A',
                user: document.User?.fullName || 'N/A',
                note: document.note || 'Không có ghi chú',
                items: document.ReturnItems || [],
                color: '#8b5cf6'
            };
        }
    };

    const docInfo = getDocumentInfo();

    const renderProductItem = (item, index) => {
        const productName = item.Product?.name || 'Sản phẩm không xác định';
        const productCode = item.Product?.productCode || 'N/A';
        const quantity = item.quantity || 0;
        const unitPrice = parseFloat(item.price || 0);
        const totalPrice = parseFloat(item.amount || (quantity * unitPrice) || 0);

        return (
            <View key={index} style={styles.productItem}>
                <View style={styles.productHeader}>
                    <Ionicons name="cube-outline" size={20} color={docInfo.color} />
                    <View style={styles.productInfo}>
                        <Text style={styles.productName}>{productName}</Text>
                        <Text style={styles.productCode}>Mã SP: {productCode}</Text>
                    </View>
                </View>

                <View style={styles.productDetails}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Số lượng:</Text>
                        <Text style={styles.detailValue}>{quantity}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Đơn giá:</Text>
                        <Text style={styles.detailValue}>{formatCurrency(unitPrice)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Thành tiền:</Text>
                        <Text style={[styles.detailValue, { color: docInfo.color, fontWeight: 'bold' }]}>
                            {formatCurrency(totalPrice)}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    style={styles.modalContainer}
                    activeOpacity={1}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <View style={[styles.header, { backgroundColor: docInfo.color }]}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.headerTitle}>{docInfo.title}</Text>
                            <Text style={styles.headerSubtitle}>{docInfo.code}</Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <ScrollView style={styles.content}>
                        {/* Thông tin chung */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Thông tin chung</Text>
                            <View style={styles.infoCard}>
                                <Text style={styles.infoText}>Ngày tạo: {formatDate(docInfo.date)}</Text>
                                <Text style={styles.infoText}>Người tạo: {docInfo.user}</Text>
                                <Text style={[styles.infoText, { color: docInfo.color, fontWeight: 'bold' }]}>
                                    Tổng tiền: {formatCurrency(document.totalAmount)}
                                </Text>
                                <Text style={styles.infoText}>Ghi chú: {docInfo.note}</Text>
                            </View>
                        </View>

                        {/* Thông tin nhà cung cấp/khách hàng */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Thông tin {docInfo.partnerLabel.toLowerCase()}</Text>
                            <View style={styles.infoCard}>
                                <Text style={styles.infoText}>Tên: {docInfo.partner}</Text>
                                <Text style={styles.infoText}>Mã: {docInfo.partnerCode}</Text>
                                <Text style={styles.infoText}>Điện thoại: {docInfo.partnerPhone}</Text>
                                <Text style={styles.infoText}>Địa chỉ: {docInfo.partnerAddress}</Text>
                            </View>
                        </View>

                        {/* Danh sách sản phẩm */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Danh sách sản phẩm ({docInfo.items.length})
                            </Text>
                            {docInfo.items.map((item, index) => renderProductItem(item, index))}
                        </View>
                    </ScrollView>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderRadius: 20,
        height: '89%',
        width: '95%',
        maxWidth: 500,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        overflow: 'hidden',
    },
    header: {
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#fff',
        opacity: 0.9,
    },
    closeButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        padding: 8,
        marginTop: -5,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    infoCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 15,
    },
    infoText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        lineHeight: 20,
    },
    productItem: {
        backgroundColor: '#f8f9fa',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    productHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    productInfo: {
        marginLeft: 10,
        flex: 1,
    },
    productName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    productCode: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
    productDetails: {
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        paddingTop: 10,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
});

export default DocumentDetailModal;
