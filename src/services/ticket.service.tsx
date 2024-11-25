import axios from 'axios';
import Datastore from 'react-native-local-mongodb';
import {API} from '../config/config';
import storageService from './storage.service';

//let db = new Datastore({filename: 'tickets', autoload: true});

class ticketService {
  api;

  constructor() {
    this.api = axios.create({baseURL: API.apiUri});
  }

  retrieveTickets = async (eventID: string, userID: string) => {
    return this.api.get(
      `/api/user/${userID}/event/${eventID}/tickets?_format=json`,
      {
        eventID: eventID,
        userID: userID,
      },
    );
  };

  retrieveAllTickets = async (userID: string) => {
    return this.api.get(`/api/user/${userID}/tickets?_format=json`, {
      userID: userID,
    });
  };

  retrieveManagedTickets = async (userID: string) => {
    return this.api.get(`/api/user/${userID}/managed/tickets?_format=json`, {
      userID: userID,
    });
  };

  // in current implementation the DB will search for ticket using the API then if an error is returned (e.g due to no internet access) it will search locally. In this implementation the API is given priority.

  validateTicket = async ticket => {
    return this.api.get(
      `api/event/${ticket.eventID}/ticket/${ticket.code}/validate?_format=json`,
    );
  };

  validateTicketShort = async ticket => {
    return this.api.get(
      `api/event/${ticket.eventID}/ticket/${ticket.code}/shortcode?_format=json`,
    );
  };

  redeemTicket = async (ticket, eventID) => {
    console.log('redeem' + ticket);
    return this.api.get(`api/event/${eventID}/ticket/${ticket.code}/avail`);
  };

  // redeemTicket = (
  //   data,
  //   setIsValid,
  //   eventID,
  //   setScanned,
  //   ticketID,
  //   setRedeemed,
  //   setTicket,
  // ) => {
  //   console.log(data.data);

  //   this.api
  //     .post(
  //       `/event/${eventID}/ticket/${data.data}/use`, // link to sync with ticketID state
  //     )
  //     .then(function (response) {
  //       setIsValid(false);
  //       setScanned(false);
  //       setRedeemed(false);
  //       setTicket({eventName: '', ticketID: ''});

  //       console.log(response);
  //       // LOCAL DB implementation : TODO clean up into function
  //       // this function will search the API for ticket, once it has been found the API will process the use of ticket and locally the state will update to reflect this, the LOCALDB is also updated however we do not rely on this for state changes as API takes priority.
  //       let usersTicket = data.data;
  //       db.find({ticketID: usersTicket}, function (err, ticket) {
  //         db.update(
  //           {ticketID: usersTicket},
  //           {$set: {redeemed: true}},
  //           {multi: true},
  //           function (err, numReplaced) {},
  //         );
  //       });
  //     })
  //     .catch(function (error) {
  //       console.log(error);
  //       //LOCAL DB IMPLEMENTATION : TODO clean up into function
  //       let usersTicket = data.data;
  //       db.find({ticketID: usersTicket}, function (err, ticket) {
  //         db.update(
  //           {ticketID: usersTicket},
  //           {$set: {redeemed: true}},
  //           {multi: true},
  //           function (err, numReplaced) {
  //             setIsValid(false);
  //             setScanned(false);
  //           },
  //         );
  //       });
  //     });
  // };
}
export default new ticketService();
