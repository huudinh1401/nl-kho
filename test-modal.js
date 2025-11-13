// Test file để kiểm tra DocumentDetailModal component
import React from 'react';
import { View } from 'react-native';
import DocumentDetailModal from './src/components/DocumentDetailModal';

// Sample data để test modal (theo cấu trúc API thực tế)
const sampleDocument = {
    id: 236,
    documentType: 'import',
    importCode: 'PN3',
    supplierId: 15,
    totalAmount: '280000.0000',
    status: 'pending',
    importType: 'retail',
    note: null,
    userId: 5,
    importDate: '2025-11-12T12:28:48.000Z',
    createdAt: '2025-11-12T12:28:47.000Z',
    updatedAt: '2025-11-12T12:30:44.000Z',
    Supplier: {
        id: 15,
        supplierCode: '3401161634-VINHPHUC',
        name: 'CÔNG TY TNHH TM-DV VĨNH PHÚC',
        phone: '0935728585',
        address: '757 Trần Hưng Đạo, Phường Tiến Thành, Tỉnh Lâm Đồng'
    },
    User: {
        id: 5,
        fullName: 'Hồ Dũng',
        email: 'hodung@gmail.com'
    },
    ImportItems: [
        {
            id: 352,
            importId: 236,
            productId: 59,
            manualProductId: null,
            barcodeId: 385,
            quantity: 1,
            quantity_retail: 1,
            quantity_project: 0,
            price: '280000.0000',
            amount: '280000.0000',
            scannedBarcodes: '["5911762921834"]',
            scannedBarcodeIds: '[385]',
            note: null,
            createdAt: '2025-11-12T12:30:44.000Z',
            updatedAt: '2025-11-12T12:30:44.000Z',
            Product: {
                id: 59,
                productCode: 'INK-TO-TTI',
                name: 'Mực photocopy Toshiba TTi'
            },
            ManualProduct: null
        }
    ]
};

const TestModal = () => {
    return (
        <View style={{ flex: 1 }}>
            <DocumentDetailModal
                visible={true}
                onClose={() => console.log('Modal closed')}
                document={sampleDocument}
            />
        </View>
    );
};

export default TestModal;
