import axios from 'axios';
import Datastore from 'react-native-local-mongodb';
import {API} from '../config/config';
import dateService from './helpers';

let db = new Datastore({filename: 'asyncStorageKey', autoload: true});

class eventService {
  api;

  constructor() {
    this.api = axios.create({baseURL: API.apiUri});
  }

  // fetches events to scan if user is logged in / chooses to scan for an event they are associated with
  fetchEvents = async (userID: string, userRole: any) => {
    // fetches events to be shown to user
    if (userRole === 'fan') {
      return this.api.get(`/api/user/${userID}/events?_format=json`, {
        userID: userID,
      });
      // fetches events to scan for
    } else if (userRole === 'scanner') {
      return this.api.get(`/api/user/${userID}/managed/events?_format=json`, {
        userID: userID,
      });
    }
  };

  sortEvents = events => {
    const date = dateService.fetchDate();
    let futureOrPresentEvents = [];
    events.forEach(event => {
      if (date <= event.event_start) {
        futureOrPresentEvents.push(event);
      }
    });
    // sorts events by start date
    futureOrPresentEvents.sort(function (a, b) {
      return a.event_start.localeCompare(b.event_start);
    });
    return futureOrPresentEvents;
  };
}
export default new eventService();
