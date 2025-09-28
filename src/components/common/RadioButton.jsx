import React, { memo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../themes/colors';

const RadioButton = memo(({ label, selected, onSelect }) => (
  <TouchableOpacity 
    style={styles.radioButtonContainer} 
    onPress={onSelect}
    activeOpacity={0.7}
  >
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
    <Text style={styles.radioLabel}>{label}</Text>
  </TouchableOpacity>
));

RadioButton.displayName = 'RadioButton';

const styles = StyleSheet.create({
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    flex: 1,
    minWidth: 80,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: THEME.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioOuterSelected: {
    borderColor: THEME.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: THEME.primary,
  },
  radioLabel: {
    fontSize: 15,
    color: THEME.textPrimary,
    fontWeight: '500',
  },
});

export default RadioButton;
