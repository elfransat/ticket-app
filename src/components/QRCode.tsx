import React from 'react';
import {StyleSheet} from 'react-native';
import {Button as PaperButton} from 'react-native-paper';
import {theme} from '@config/theme';
import QRCode from 'react-native-qrcode-svg';

export default function CustomQRCode({code, enabled, size}) {
  return (
    <QRCode
      value={code}
      size={size}
      // enableLinearGradient={!enabled} // once disabled linearGradient and gradientDirection are not applied
      // linearGradient={['rgb(211,211,211)', 'rgb(255,255,255)']} //TODO: implement once tested further
      // gradientDirection={['0', '0', '0', '50']}
    />
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginVertical: 10,
    paddingVertical: 2,
    borderRadius: 50,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 26,
    color: theme.colors.primaryText,
  },
});
