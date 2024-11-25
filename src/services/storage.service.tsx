import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Datastore from 'react-native-local-mongodb';

let ownedTickets = new Datastore({filename: 'tickets', autoload: true});

let managedTickets = new Datastore({filename: 'userTickets', autoload: true});

// ownedTickets.remove({}, {multi: true}, function (err, numRemoved) {});

// managedTickets.remove({}, {multi: true}, function (err, numRemoved) {});

// ownedTickets.find({}, function (err, docs) {
//   console.log('docs: ' + JSON.stringify(docs));
// });

// managedTickets.find({}, function (err, docs) {
//   console.log('docs: ' + JSON.stringify(docs));
// });

class storageService {
  secureStoreCredentials = async userCredentials => {
    return await SecureStore.setItemAsync(
      'userCredentials',
      JSON.stringify(userCredentials),
    );
  };

  secureRetrieveCredentials = async () => {
    const credentialsObj = await SecureStore.getItemAsync('userCredentials');
    return JSON.parse(credentialsObj);
  };

  secureStoreUser = async user => {
    return await SecureStore.setItemAsync('user', JSON.stringify(user));
  };

  secureRetrieveUser = async () => {
    const userObj = await SecureStore.getItemAsync('user');
    return JSON.parse(userObj);
  };

  secureDeleteUser = async () => {
    await SecureStore.deleteItemAsync('userCredentials');
  };

  /// Events Storage

  storeEvents = async (events, currentRole) => {
    return await AsyncStorage.setItem(
      `${currentRole} events`,
      JSON.stringify(events),
    );
  };

  retrieveEvents = async currentRole => {
    const eventsObj = await AsyncStorage.getItem(`${currentRole} events`);
    return JSON.parse(eventsObj);
  };

  // Tickets Storage

  storeManagedTickets = async tickets => {
    // compares the existing tickets found in local storage with the new ones found by API call - will add all new tickets and store locally

    managedTickets.find({}, {_id: 0}, function (err, existingTickets) {
      const newTickets = tickets.filter(
        ({code: code1}) =>
          !existingTickets.some(({code: code2}) => code1 === code2),
      );

      managedTickets.insert(newTickets, function (err, newDocs) {
        console.log('new managed tickets: ' + JSON.stringify(newDocs));
      });
    });
  };

  storeUserTickets = async tickets => {
    // compares the existing tickets found in local storage with the new ones found by API call - will add all new tickets and store locally
    ownedTickets.find({}, {_id: 0}, function (err, existingTickets) {
      const newTickets = tickets.filter(
        ({code: code1}) =>
          !existingTickets.some(({code: code2}) => code1 === code2),
      );

      const updateTicket = tickets.filter(({code: code1, used: used1}) =>
        existingTickets.some(
          ({code: code2, used: used2}) => code1 === code2 && !used1 === used2,
        ),
      );

      console.log('tickets to update' + JSON.stringify(updateTicket));

      ownedTickets.insert(newTickets, function (err, newDocs) {
        console.log('new tickets: ' + JSON.stringify(newDocs));
      });
    });
  };

  retrieveTickets = async (eventID, currentRole) => {
    let tickets = [];
    console.log(eventID);
    await ownedTickets.find(
      {event_id: eventID},
      {_id: 0},
      function (err, docs) {
        tickets = docs;
      },
    );
    console.log('working?? ' + JSON.stringify(tickets));
    return tickets;
  };

  validateTicket = async (code, eventID) => {
    let ticket;
    await managedTickets.findOne(
      {code: code, event_id: eventID},
      {_id: 0},
      function (err, doc) {
        ticket = doc;
        console.log(doc);
      },
    );
    return ticket;
  };

  validateTicketShort = async (code, eventID) => {
    let ticket;
    await managedTickets.findOne(
      {code: {$regex: new RegExp(code)}, event_id: eventID},
      {_id: 0},
      function (err, doc) {
        ticket = doc;
        console.log(doc);
      },
    );
    return ticket;
  };

  redeemTicket = async (code, eventID) => {
    console.log(code + ' ' + eventID);
    await managedTickets.update(
      {code: code, event_id: eventID},
      {$set: {used: '1', usedAt: Date.now()}},
      {},
      function (err, numReplaced) {
        console.log(numReplaced);
      },
    );
  };

  retrieveTicketsRedeemedSinceNetworkLost = async () => {
    const timeConnectionLost = await this.retrieveOnConnectionLost();
    console.log(timeConnectionLost);
    managedTickets.find(
      {
        used: '1',
        usedAt: {$gt: timeConnectionLost, $lt: Date.now()},
      },
      {_id: 0},
      function (err, docs) {
        console.log('redeemed since:' + JSON.stringify(docs));
      },
    );
    // this.deleteOnConnectionLost();
  };

  setOnConnectionLost = async () => {
    // sets onConnectionLost to current time
    return await AsyncStorage.setItem(
      'timeConnectionLost',
      Date.now().toString(),
    );
  };

  retrieveOnConnectionLost = async () => {
    // const timeConnectionLost = await AsyncStorage.getItem('timeConnectionLost');
    // // console.log(timeConnectionLost);
    // if (timeConnectionLost === null) {
    //   return await AsyncStorage.setItem(
    //     'timeConnectionLost',
    //     Date.now().toString(),
    //   );
    // } else {
    //   return timeConnectionLost;
    // }

    return await AsyncStorage.getItem('timeConnectionLost');
  };
}

export default new storageService();
