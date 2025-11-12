import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getImports, approveImport, getInvoices, approveInvoice, getReturns, approveReturn } from '../services/api';

const ApproveDocumentsScreen = ({ navigation }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [approvingId, setApprovingId] = useState(null);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            setLoading(true);

            // Gọi cả 3 API song song
            const [importsResult, invoicesResult, returnsResult] = await Promise.all([
                getImports().catch(() => []),
                getInvoices().catch(() => []),
                getReturns().catch(() => [])
            ]);

            // Xử lý phiếu nhập
            const importsArray = Array.isArray(importsResult)
                ? importsResult
                : importsResult.data || [];
            const pendingImports = importsArray
                .filter(doc => doc.status === 'pending')
                .map(doc => ({ ...doc, documentType: 'import' }));

            // Xử lý phiếu xuất
            const invoicesArray = Array.isArray(invoicesResult)
                ? invoicesResult
                : invoicesResult.data || [];

            const pendingInvoices = invoicesArray
                .filter(doc => doc.status === 'pending')
                .map(doc => ({ ...doc, documentType: 'invoice' }));

            // Xử lý phiếu trả hàng
            const returnsArray = Array.isArray(returnsResult)
                ? returnsResult
                : returnsResult.data || [];
            const pendingReturns = returnsArray
                .filter(doc => doc.status === 'pending')
                .map(doc => ({ ...doc, documentType: 'return' }));

            // Gộp tất cả phiếu và sắp xếp theo ngày tạo
            const allPendingDocuments = [...pendingImports, ...pendingInvoices, ...pendingReturns]
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setDocuments(allPendingDocuments);

        } catch (error) {
            console.error('❌ Lỗi khi tải phiếu:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách phiếu cần duyệt');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await loadDocuments();
        setRefreshing(false);
    };

    const handleApprove = (document) => {
        const documentCode = document.importCode || document.invoiceCode || document.returnCode || 'N/A';
        const supplierOrCustomer = document.Supplier?.name || document.Customer?.name || 'N/A';
        const typeText = document.documentType === 'import' ? 'phiếu nhập' :
            document.documentType === 'return' ? 'phiếu trả hàng' : 'phiếu xuất';
        const partnerLabel = document.documentType === 'import' ? 'Nhà cung cấp' :
            document.documentType === 'return' ? (document.Supplier ? 'Nhà cung cấp' : 'Khách hàng') : 'Khách hàng';

        Alert.alert(
            'Xác nhận duyệt phiếu',
            `Bạn có chắc chắn muốn duyệt ${typeText} "${documentCode}"?\n\n${partnerLabel}: ${supplierOrCustomer}\nTổng tiền: ${formatCurrency(document.totalAmount)}`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Duyệt',
                    style: 'default',
                    onPress: () => confirmApprove(document.id, document.documentType)
                }
            ]
        );
    };

    const confirmApprove = async (documentId, documentType) => {
        try {
            setApprovingId(documentId);

            // Gọi API tương ứng với loại phiếu
            if (documentType === 'import') {
                await approveImport(documentId);
            } else if (documentType === 'invoice') {
                await approveInvoice(documentId);
            } else if (documentType === 'return') {
                await approveReturn(documentId);
            }

            const typeText = documentType === 'import' ? 'Phiếu nhập' :
                documentType === 'return' ? 'Phiếu trả hàng' : 'Phiếu xuất';
            Alert.alert('Thành công', `${typeText} đã được duyệt thành công!`);

            // Reload danh sách sau khi duyệt
            await loadDocuments();

        } catch (error) {
            console.error('❌ Lỗi khi duyệt phiếu:', error);
            Alert.alert('Lỗi', `Không thể duyệt phiếu: ${error.message}`);
        } finally {
            setApprovingId(null);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(parseFloat(amount));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDocumentTypeInfo = (document) => {
        if (document.documentType === 'import') {
            return {
                type: 'Phiếu nhập',
                subType: '',
                color: '#10b981', // Màu xanh lá cho phiếu nhập
                icon: 'add-circle-outline'
            };
        } else if (document.documentType === 'invoice') {
            // Xác định loại phiếu xuất
            let subType = '';

            switch (document.invoiceType) {
                case 'sale':
                    subType = 'Bán hàng';
                    break;
                case 'project_export':
                    subType = 'Xuất hàng dự án';
                    break;
                case 'warranty_export':
                    subType = 'Xuất bảo hành';
                    break;
                case 'liquidation_export':
                    subType = 'Xuất thanh lý';
                    break;
                default:
                    subType = 'Bán hàng';
            }

            return {
                type: `Phiếu xuất - ${subType}`,
                subType: '',
                color: '#f59e0b', // Màu cam cho tất cả phiếu xuất
                icon: 'remove-circle-outline' // Icon chung cho tất cả phiếu xuất
            };
        } else if (document.documentType === 'return') {
            // Xác định loại phiếu trả hàng
            let subType = '';

            switch (document.returnType) {
                case 'sale':
                    subType = 'Trả hàng bán lẻ';
                    break;
                case 'project_return':
                    subType = 'Trả hàng dự án';
                    break;
                case 'warranty_return':
                    subType = 'Trả hàng bảo hành';
                    break;
                case 'supplier_return':
                    subType = 'Trả hàng cho NCC';
                    break;
                default:
                    subType = 'Trả hàng khác';
            }

            return {
                type: `Phiếu trả - ${subType}`,
                subType: '',
                color: '#8b5cf6', // Màu tím cho tất cả phiếu trả hàng
                icon: 'return-down-back-outline' // Icon trả hàng
            };
        }

        // Fallback cho các loại phiếu khác
        return {
            type: 'Phiếu khác',
            subType: '',
            color: '#6b7280',
            icon: 'document-outline'
        };
    };

    const renderDocumentItem = (document) => {
        const typeInfo = getDocumentTypeInfo(document);
        const isApproving = approvingId === document.id;

        return (
            <View key={document.id} style={{
                backgroundColor: '#fff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
                borderLeft: `4px solid ${typeInfo.color}`
            }}>
                {/* Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{
                            backgroundColor: typeInfo.color,
                            borderRadius: 20,
                            padding: 8,
                            marginRight: 12
                        }}>
                            <Ionicons name={typeInfo.icon} size={20} color="#fff" />
                        </View>
                        <View>
                            <View>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>
                                    {document.importCode || document.invoiceCode || document.returnCode || 'N/A'}
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                    <Text style={{
                                        fontSize: 12,
                                        color: typeInfo.color,
                                        fontWeight: '600',
                                        marginRight: typeInfo.subType ? 6 : 0
                                    }}>
                                        {typeInfo.type}
                                    </Text>
                                    {typeInfo.subType ? (
                                        <View style={{
                                            backgroundColor: `${typeInfo.color}20`,
                                            paddingHorizontal: 6,
                                            paddingVertical: 2,
                                            borderRadius: 4,
                                            borderWidth: 1,
                                            borderColor: typeInfo.color,
                                        }}>
                                            <Text style={{ fontSize: 10, color: typeInfo.color, fontWeight: '600' }}>
                                                {typeInfo.subType}
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                        </View>
                    </View>
                    <View style={{
                        backgroundColor: '#fef3c7',
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 12
                    }}>
                        <Text style={{ fontSize: 12, color: '#d97706', fontWeight: '600' }}>
                            Chờ duyệt
                        </Text>
                    </View>
                </View>

                {/* Content */}
                <View style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="business-outline" size={16} color="#6b7280" />
                        <Text style={{ marginLeft: 8, fontSize: 14, color: '#374151', flex: 1 }}>
                            {document.documentType === 'import'
                                ? (document.Supplier?.name || 'N/A')
                                : document.documentType === 'return'
                                    ? (document.Supplier?.name || document.Customer?.name || 'N/A')
                                    : (document.Customer?.name || 'N/A')
                            }
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="cash-outline" size={16} color="#6b7280" />
                        <Text style={{ marginLeft: 8, fontSize: 14, color: '#374151', fontWeight: '600' }}>
                            {formatCurrency(document.totalAmount)}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                        <Ionicons name="time-outline" size={16} color="#6b7280" />
                        <Text style={{ marginLeft: 8, fontSize: 14, color: '#374151' }}>
                            {formatDate(document.importDate || document.invoiceDate || document.createdAt)}
                        </Text>
                    </View>
                    {(document.ImportItems || document.InvoiceItems || document.ReturnItems) && (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="list-outline" size={16} color="#6b7280" />
                            <Text style={{ marginLeft: 8, fontSize: 14, color: '#374151' }}>
                                {(document.ImportItems || document.InvoiceItems || document.ReturnItems || []).length} sản phẩm
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                    style={{
                        backgroundColor: typeInfo.color,
                        borderRadius: 8,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: isApproving ? 0.7 : 1
                    }}
                    onPress={() => handleApprove(document)}
                    disabled={isApproving}
                >
                    {isApproving ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    )}
                    <Text style={{
                        color: '#fff',
                        fontWeight: '600',
                        marginLeft: 8,
                        fontSize: 16
                    }}>
                        {isApproving ? 'Đang duyệt...' : 'Duyệt phiếu'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={['#15803d', '#16a34a', '#22c55e']} style={{ flex: 1 }}>

                {/* Header */}
                <View style={{ paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={{ marginRight: 16 }}
                        >
                            <Ionicons name="arrow-back" size={24} color="#fff" />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 24,
                                fontWeight: 'bold',
                                color: '#fff',
                                textShadowColor: 'rgba(0,0,0,0.3)',
                                textShadowOffset: { width: 1, height: 1 },
                                textShadowRadius: 3
                            }}>
                                Duyệt Phiếu
                            </Text>
                            <Text style={{ fontSize: 14, color: '#fff', opacity: 0.9, marginTop: 2 }}>
                                {documents.length} phiếu chờ duyệt
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={onRefresh}
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 25, padding: 8 }}
                        >
                            <Ionicons name="refresh-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Content */}
                <View style={{ flex: 1, backgroundColor: '#f8fafc', borderTopLeftRadius: 25, borderTopRightRadius: 25 }}>
                    {loading ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#16a34a" />
                            <Text style={{ marginTop: 16, fontSize: 16, color: '#6b7280' }}>
                                Đang tải phiếu...
                            </Text>
                        </View>
                    ) : (
                        <ScrollView
                            style={{ flex: 1 }}
                            contentContainerStyle={{ padding: 20 }}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                            }
                        >
                            {documents.length === 0 ? (
                                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 }}>
                                    <Ionicons name="document-outline" size={64} color="#d1d5db" />
                                    <Text style={{ fontSize: 18, color: '#6b7280', marginTop: 16, textAlign: 'center' }}>
                                        Không có phiếu nào cần duyệt
                                    </Text>
                                    <Text style={{ fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' }}>
                                        Tất cả phiếu đã được xử lý
                                    </Text>
                                </View>
                            ) : (
                                documents.map(renderDocumentItem)
                            )}
                        </ScrollView>
                    )}
                </View>
            </LinearGradient>
        </View>
    );
};

export default ApproveDocumentsScreen;
