import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/Colors';

interface CardProps {
    children: React.ReactNode;
    variant?: 'default' | 'elevated' | 'outlined';
    style?: ViewStyle;
}

export function Card({ children, variant = 'default', style }: CardProps) {
    return (
        <View style={[styles.base, styles[variant], style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 16,
        padding: 16,
        backgroundColor: colors.surface,
    },
    default: {
        // Uses base styles
    },
    elevated: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    outlined: {
        borderWidth: 1,
        borderColor: colors.border,
    },
});
