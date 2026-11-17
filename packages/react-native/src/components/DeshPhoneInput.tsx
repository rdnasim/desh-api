import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

const OPERATORS: Record<string, string> = {
  '013': 'Grameenphone',
  '017': 'Grameenphone',
  '014': 'Banglalink',
  '019': 'Banglalink',
  '018': 'Robi',
  '016': 'Airtel',
  '015': 'Teletalk',
};

export interface DeshPhoneInputProps extends TextInputProps {
  onOperatorChange?: (operator: string | null) => void;
  onValidChange?: (isValid: boolean) => void;
}

export function DeshPhoneInput({
  onOperatorChange,
  onValidChange,
  onChangeText,
  style,
  ...props
}: DeshPhoneInputProps) {
  const [operator, setOperator] = useState<string | null>(null);

  const handleChangeText = (text: string) => {
    const raw = text.replace(/[^0-9]/g, '');
    let local = raw;
    if (local.startsWith('880')) local = local.slice(2);

    let detected: string | null = null;
    if (local.startsWith('0') && local.length >= 3) {
      const pfx = local.slice(0, 3);
      detected = OPERATORS[pfx] || null;
    }
    setOperator(detected);
    onOperatorChange?.(detected);

    const isValid = /^01[3-9]\d{8}$/.test(local);
    onValidChange?.(isValid);

    onChangeText?.(text);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.prefix}>🇧🇩 +880</Text>
      <TextInput
        keyboardType="phone-pad"
        placeholder="1711223344"
        style={[styles.input, style]}
        onChangeText={handleChangeText}
        {...props}
      />
      {operator && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{operator}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  prefix: {
    fontWeight: '600',
    color: '#374151',
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#111827',
  },
  badge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
});
