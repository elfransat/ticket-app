import axios from 'axios';
import {Alert} from 'react-native';
import {API} from '../config/config';
const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking');
import * as SecureStore from 'expo-secure-store';

class authService {
  api;

  constructor() {
    this.api = axios.create({baseURL: API.apiUri});
  }

  login = async (mail: any, password: any) => {
    return this.api.post(`/user/login?_format=json`, {
      mail: mail,
      pass: password,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  retrieveToken = async () => {
    try {
      return await SecureStore.getItemAsync('userDetails');
    } catch (error) {
      return error;
    }
  };

  storeToken = async (email, password) => {
    const credentials = {email, password};
    console.log(credentials);
    try {
      console.log('value of credentials: ', credentials);
      if (credentials) {
        const myJson = JSON.parse(credentials);
        this.login(myJson.email, myJson.password);
        console.log('retrieved detais..');
      }
    } catch (error) {
      console.log(error);
    }
  };

  register = async (mail: any, pass: any, name: any, field_i_am: any) => {
    // let token = this.api.get(`/user/register?_format=json`);
    return this.api.post(
      `/user/register?_format=json`,
      {
        mail: [mail],
        name: [name],
        pass: [pass],
        field_i_am: [field_i_am],
      },
      // {
      //   headers: {
      //     'X-CSRF-Token': token,
      //   },
      // },
    );
  };

  getUser = async (uid: string) => {
    // let token = this.api.get(`/rest/session/token`);
    // console.log('TOKEN' + JSON.stringify(token));
    return this.api.get(
      `/user/${uid}?_format=json`,
      {
        uid: uid,
      },
      // {
      //   headers: {
      //     'X-CSRF-Token': token,
      //   },
      // },
    );
  };

  resetPassword = async (mail: string) => {
    return this.api.post(`/api/user/password/reset?_format=json`, {
      name: mail,
    });
  };
}

export default new authService();
