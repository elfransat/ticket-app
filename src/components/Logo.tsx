import React from 'react';
import {Image, StyleSheet} from 'react-native';

export function LogoBig() {
  return <Image source={require('@assets/logo.png')} style={styles.imageBig} />;
}

export function LogoSmall() {
  return (
    <Image source={require('@assets/logo.png')} style={styles.imageSmall} />
  );
}

const styles = StyleSheet.create({
  imageBig: {
    width: 300,
    height: 200,
    marginBottom: 3,
  },
  imageSmall: {
    width: 80,
    height: 50,
    marginHorizontal: 220,
    marginBottom: 50,
  },
});
