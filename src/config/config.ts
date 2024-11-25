import {EXPO_API_URL} from '@env';

let uri;
if (__DEV__) {
  uri = 'https:/example.com';
} else {
  uri = 'https:/example.com';
}

export const API = {
  apiUri: uri,
};
