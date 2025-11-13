import React from 'react';
import { View, Text } from 'react-native';

const Badge = ({ count, maxDisplay = 9, backgroundColor = '#ef4444' }) => {
    if (!count || count <= 0) {
        return null;
    }

    const displayCount = count > maxDisplay ? `${maxDisplay}+` : count.toString();

    return (
        <View style={{
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: backgroundColor,
            borderRadius: 12,
            minWidth: 24,
            height: 24,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 6,
            borderWidth: 2,
            borderColor: '#fff',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        }}>
            <Text style={{
                color: '#fff',
                fontSize: 12,
                fontWeight: 'bold',
                textAlign: 'center',
            }}>
                {displayCount}
            </Text>
        </View>
    );
};

export default Badge;
