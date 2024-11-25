import React, {useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import {Text} from 'react-native-paper';
import Background from '@components/Background';
import {LogoSmall} from '@components/Logo';
import Header from '@components/Header';
import Button from '@components/Button';
import TextInput from '@components/TextInput';
import {theme} from '@config/theme';
import validator from '@services/authValidator';
const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking');
import auth from '@services/auth.service';
import RNPickerSelect from 'react-native-picker-select';
import {StatusBar} from 'expo-status-bar';
import authService from '@services/auth.service';

interface Name {
  value: string;
  error: string;
}
interface Email {
  value: string;
  error: string;
}

interface Password {
  value: string;
  error: string;
}

interface UserRole {
  value: string;
  label: string;
}

export default function RegisterScreen({navigation}: any) {
  const [userName, setUserName] = useState<Name>({value: '', error: ''});
  const [email, setEmail] = useState<Email>({value: '', error: ''});
  const [password, setPassword] = useState<Password>({value: '', error: ''});
  const [serverError, setServerError] = useState<string>('');
  const [serverSuccess, setServerSuccess] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  const onRegisterPressed = (mail, pass, name, role) => {
    const nameError: string = validator.name(userName.value);
    const emailError: string = validator.email(email.value);
    const passwordError: string = validator.password(password.value);
    if (emailError || passwordError || nameError) {
      setUserName({...userName, error: nameError});
      setEmail({...email, error: emailError});
      setPassword({...password, error: passwordError});
      return;
    }
    auth
      .register(mail, pass, name, role)
      .then(response => {
        console.log('UID' + response.data.uid[0].value);
        auth.getToken();
        // if correct credentials navigate and pass returned user as prop - in addition email and pass are set to intial values
        let token = authService.getUser(response.data.uid[0].value);
        setServerSuccess('Successful registration...');
        // ensures there is a delay of 2 seconds before redirecting
        setTimeout(() => {
          navigation.navigate('EventsScreen', token);
        }, 2000);
      })
      .catch(error => {
        // if incorrect credentials displays error to user and resets email and pass
        console.log(error.response);
        setUserName({value: '', error: ''});
        setEmail({value: '', error: ''});
        setPassword({value: '', error: ''});
        setUserRole('');
        setServerError(error.response.data.message);
      });
  };

  return (
    <Background>
      <StatusBar
        animated={true}
        backgroundColor={theme.colors.background}
        style="light"
      />
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('LoginScreen');
          RCTNetworking.clearCookies(() => {});
        }}
        style={styles.backButtonContainer}>
        <Image
          style={styles.image}
          source={require('@assets/arrow_back.png')}
        />
      </TouchableOpacity>
      <LogoSmall />
      <Header>Create Account</Header>
      <ScrollView style={styles.scrollViewContainer}>
        <TextInput
          label="Name"
          returnKeyType="next"
          value={userName.value}
          onChangeText={(text: string) => setUserName({value: text, error: ''})}
          error={!!userName.error}
          errorText={userName.error}
        />
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
        <View style={styles.dropdownContainer}>
          <RNPickerSelect
            useNativeAndroidPickerStyle={false}
            placeholder={{label: 'Select user role...', value: null}}
            onValueChange={(value: string) => setUserRole(value)}
            style={{
              inputIOS: {
                fontSize: 17,
                paddingVertical: 20,
              },
              inputAndroid: {
                fontSize: 17,
                paddingVertical: 20,
                color: 'black',
              },
              placeholder: {
                color: '#77777a',
              },
            }}
            items={[
              {label: 'fan', value: 'fan'},
              {label: 'artist or influencer', value: 'act'},
              {label: 'venue', value: 'venue'},
              {
                label: 'promoter or event organzier',
                value: 'promoter',
              },
              {label: 'sponsor', value: 'sponsor'},
            ]}
          />
        </View>
        {!!serverError && <Text style={styles.errorText}>{serverError}</Text>}
        {!!serverSuccess && (
          <Text style={styles.successText}>{serverSuccess}</Text>
        )}
        <Button
          mode="contained"
          onPress={() => {
            onRegisterPressed(
              email.value,
              password.value,
              userName.value,
              userRole,
            );
            setServerError('');
            setUserRole('');
          }}
          style={{backgroundColor: theme.colors.primary, marginTop: 24}}>
          Sign Up
        </Button>
        <View style={styles.LoginContainer}>
          <Text style={styles.text}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
            <Text style={styles.linkText}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Background>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 24,
    height: 24,
  },

  /* -------------------------------------------------------------------------- */
  /*                              container styling                             */
  /* -------------------------------------------------------------------------- */

  backButtonContainer: {
    position: 'absolute',
    top: 7, //aligned with logo
    left: 4,
  },

  scrollViewContainer: {
    // ensures page is scrollable if necessary
    width: '100%',
    flex: 1,
    marginBottom: 50,
  },

  dropdownContainer: {
    marginVertical: 12,
    fontSize: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 4,
    color: 'black',
    backgroundColor: 'white',
    paddingRight: 30,
    width: '100%',
  },

  LoginContainer: {
    flexDirection: 'row',
    marginTop: 4,
    justifyContent: 'center',
  },

  /* -------------------------------------------------------------------------- */
  /*                                text styling                                */
  /* -------------------------------------------------------------------------- */
  text: {
    color: 'white',
  },

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

  linkText: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
});
