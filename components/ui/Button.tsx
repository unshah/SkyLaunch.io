import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    ViewStyle,
    TextStyle,
} from 'react-native';
import { colors } from '../../constants/Colors';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    style,
    textStyle,
}: ButtonProps) {
    const buttonStyles = [
        styles.base,
        styles[variant],
        styles[`${size}Size`],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`${variant}Text`],
        styles[`${size}Text`],
        disabled && styles.disabledText,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? colors.textInverse : colors.primary}
                    size="small"
                />
            ) : (
                <Text style={textStyles}>{title}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    // Variants
    primary: {
        backgroundColor: colors.primary,
    },
    secondary: {
        backgroundColor: colors.secondary,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    ghost: {
        backgroundColor: 'transparent',
    },
    // Sizes
    smallSize: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    mediumSize: {
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    largeSize: {
        paddingVertical: 18,
        paddingHorizontal: 32,
    },
    // Text base
    text: {
        fontWeight: '600',
    },
    // Text variants
    primaryText: {
        color: colors.textInverse,
    },
    secondaryText: {
        color: colors.textInverse,
    },
    outlineText: {
        color: colors.primary,
    },
    ghostText: {
        color: colors.primary,
    },
    // Text sizes
    smallText: {
        fontSize: 14,
    },
    mediumText: {
        fontSize: 16,
    },
    largeText: {
        fontSize: 18,
    },
    // Disabled
    disabled: {
        opacity: 0.5,
    },
    disabledText: {
        opacity: 0.7,
    },
});
