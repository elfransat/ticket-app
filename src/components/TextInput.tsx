import React, {useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import {TextInput as Input} from 'react-native-paper';
import {theme} from '@config/theme';

export default function TextInput({errorText, description, ...props}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      <Input
        style={[
          props.style,
          {
            backgroundColor: theme.colors.surface,
          }, // static style
          isFocused && {
            //styles applied on focus : hacky solution since react native paper by default includes border at bottom that cannot be removed
            borderLeftWidth: 2,
            borderRightWidth: 2,
            borderTopWidth: 2,
            borderColor: theme.colors.primary,
          },
        ]}
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
        selectionColor={theme.colors.secondary}
        mode="flat"
        {...props}
      />
      {description && !errorText ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 12,
    fontSize: 24,
  },
  input: {
    backgroundColor: theme.colors.surface,
  },
  description: {
    fontSize: 13,
    color: theme.colors.primaryText,
    paddingTop: 8,
  },
  error: {
    fontSize: 13,
    color: theme.colors.error,
    paddingTop: 8,
  },
});
