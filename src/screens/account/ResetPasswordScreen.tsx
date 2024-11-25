import React, {useState} from 'react';
import Background from '@components/Background';
import BackButton from '@components/BackButton';
import {LogoSmall} from '@components/Logo';
import Header from '@components/Header';
import TextInput from '@components/TextInput';
import Button from '@components/Button';
import validator from '@services/authValidator';
import auth from '@services/auth.service';
import {theme} from '@config/theme';
import {StatusBar} from 'expo-status-bar';
import {View, Text, StyleSheet} from 'react-native';

interface Email {
  value: string;
  error: string;
}

interface props {
  navigation: any;
  email: Email;
}

export default function ResetPasswordScreen({navigation}: any) {
  const [email, setEmail] = useState<Email>({
    value: '',
    error: '',
  });
  const [serverError, setServerError] = useState<string>('');
  const [serverSuccess, setServerSuccess] = useState<string>('');

  const sendResetPasswordEmail = mail => {
    const emailError = validator.email(email.value);
    if (emailError) {
      setEmail({...email, error: emailError});
      return;
    }
    auth.resetPassword(mail).then(response => {
      console.log(response.request._response);
      if (response.request._response === 'true') {
        // ensures there is a delay of 2 seconds before redirecting
        setServerSuccess('Password reset link sent..');
        setTimeout(() => {
          navigation.navigate('LoginScreen');
        }, 2000);
      } else {
        // console.log('fail');
        setEmail({...email, value: '', error: ''});
        setServerError('User not found with that email...');
      }
    });
  };

  return (
    <Background>
      <StatusBar
        animated={true}
        backgroundColor={theme.colors.background}
        style="light"
      />
      <BackButton goBack={navigation.goBack} />
      <LogoSmall />
      <Header>Reset Password</Header>
      <TextInput
        label="E-mail address"
        returnKeyType="done"
        value={email.value}
        onChangeText={(text: string) => setEmail({value: text, error: ''})}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
        description="You will receive email with password reset link."
      />
      <View>
        {!!serverError && <Text style={styles.errorText}>{serverError}</Text>}
        {!!serverSuccess && (
          <Text style={styles.successText}>{serverSuccess}</Text>
        )}
      </View>
      <Button
        mode="contained"
        onPress={() => {
          sendResetPasswordEmail(email.value);
          setServerError('');
        }}
        style={{marginTop: 16, backgroundColor: theme.colors.primary}}>
        Send Instructions
      </Button>
    </Background>
  );
}

const styles = StyleSheet.create({
  successText: {
    fontSize: 15,
    color: theme.colors.success,
    textAlign: 'center',
    paddingTop: 8,
  },

  errorText: {
    fontSize: 15,
    color: theme.colors.error,
    paddingTop: 8,
  },
});
