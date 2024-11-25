import React, {useState, useEffect, useContext} from 'react';
import {TouchableOpacity, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import Background from '@components/Background';
import {LogoSmall} from '@components/Logo';
import Button from '@components/Button';
import TextInput from '@components/TextInput';
import {theme} from '@config/theme';
import validator from '@services/authValidator';
import auth from '@services/auth.service';
import {StatusBar} from 'expo-status-bar';
import {useAppSelector, useAppDispatch} from '@redux/hooks';
import {loginUser, setErrorCode} from '@redux/slices/authSlice';
import {RootState} from '@redux/store';

interface Email {
  value: string;
  error: string;
}

interface Password {
  value: string;
  error: string;
}

interface AuthContextType {
  onLogin(mail, pass): Promise<any>;
  serverError: string;
}

export default function LoginScreen({navigation}) {
  const serverError = useAppSelector(
    (state: RootState) => state.auth.errorCode,
  );
  const [email, setEmail] = useState<Email>({value: '', error: ''});
  const [password, setPassword] = useState<Password>({value: '', error: ''});
  const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking');
  const dispatch = useAppDispatch();

  const validateCredentials = (mail, pass) => {
    // ensures password meets required parameters and displays to user
    const emailError = validator.email(email.value);
    const passwordError = validator.password(password.value);
    if (emailError || passwordError) {
      setEmail({...email, error: emailError});
      setPassword({...password, error: passwordError});
      return;
    }
  };

  useEffect(() => {
    RCTNetworking.clearCookies(() => {});
  }, []);

  const onLoginPressed = (mail, pass) => {
    const credentials = {mail, pass}; // TODO make user object to ensure we dont need to create object here
    const emailError = validator.email(email.value);
    const passwordError = validator.password(password.value);
    if (emailError || passwordError) {
      setEmail({...email, error: emailError});
      setPassword({...password, error: passwordError});
      dispatch(setErrorCode(null));
      return;
    } else {
      dispatch(loginUser(credentials));
      dispatch(setErrorCode(null));
    }
  };
  return (
    <Background>
      <StatusBar
        animated={true}
        backgroundColor={theme.colors.background}
        style="light"
      />
      <LogoSmall />
      <Text style={styles.header}>Sign in to Eventual Tickets</Text>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text: string) => setEmail({value: text, error: ''})}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text: string) => setPassword({value: text, error: ''})}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      {!!serverError && <Text style={styles.errorText}>{serverError}</Text>}
      <Button
        mode="contained"
        uppercase={false}
        onPress={() => {
          validateCredentials(email.value, password.value);
          if (!email.error || !password.error) {
            onLoginPressed(email.value, password.value);
          }
        }}
        style={styles.signIn}>
        Sign In
      </Button>
      <View style={styles.forgotContainer}>
        <Text style={styles.text}>Forgot your password? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ResetPasswordScreen')}>
          <Text style={styles.link}>Reset</Text>
        </TouchableOpacity>
      </View>
      {/* <View style={styles.signupContainer}>
        <Text style={styles.text}>Don’t have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('RegisterScreen')}>
          <Text style={styles.link}>Sign up</Text>
        </TouchableOpacity>
      </View> */}
    </Background>
  );
}

const styles = StyleSheet.create({
  signupContainer: {
    flexDirection: 'row',
    marginTop: 15,
  },
  forgotContainer: {
    flexDirection: 'row',
    marginTop: 10,
    fontSize: 14,
    color: theme.colors.primaryText,
  },

  header: {
    color: 'white',
    //marginRight: 'auto',
    paddingHorizontal: 0,
    fontSize: 18,
    fontWeight: 'bold',
    paddingVertical: 12,
  },

  /* -------------------------------------------------------------------------- */
  /*                               Text Styling                              */
  /* -------------------------------------------------------------------------- */

  errorText: {
    fontSize: 15,
    color: theme.colors.error,
    paddingTop: 8,
  },

  signIn: {
    backgroundColor: theme.colors.primary,
    marginBottom: 20,
    marginTop: 15,
  },

  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },

  text: {
    color: 'white',
  },
});
