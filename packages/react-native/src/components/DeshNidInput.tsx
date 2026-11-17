import { useState } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

export interface DeshNidInputProps extends TextInputProps {
  onValidChange?: (isValid: boolean, type: 'smart' | 'old' | 'extended' | null) => void;
}

export function DeshNidInput({ onValidChange, onChangeText, style, ...props }: DeshNidInputProps) {
  const [nidType, setNidType] = useState<'smart' | 'old' | 'extended' | null>(null);

  const handleChangeText = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');

    let type: 'smart' | 'old' | 'extended' | null = null;
    if (digits.length === 10) type = 'smart';
    else if (digits.length === 13) type = 'old';
    else if (digits.length === 17) type = 'extended';

    setNidType(type);
    onValidChange?.(type !== null, type);
    onChangeText?.(text);
  };

  return (
    <View style={styles.container}>
      <TextInput
        keyboardType="number-pad"
        maxLength={17}
        placeholder="10, 13, or 17 digit NID"
        style={[styles.input, style]}
        onChangeText={handleChangeText}
        {...props}
      />
      {nidType && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✓ {nidType.toUpperCase()}</Text>
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
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#111827',
  },
  badge: {
    backgroundColor: '#ecfdf5',
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
