import React, {useEffect, useState, useContext} from 'react';
import Background from '@components/Background';
import {LogoSmall} from '@components/Logo';
import eventService from '../services/event.service';
import {theme} from '@config/theme';
import {Text, Searchbar} from 'react-native-paper';
import * as SecureStore from 'expo-secure-store';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from 'react-native';
import {ListItem, Avatar} from 'react-native-elements';
const RCTNetworking = require('react-native/Libraries/Network/RCTNetworking');
import {useFocusEffect} from '@react-navigation/native';
import FadeInOut from 'react-native-fade-in-out';
import {StatusBar} from 'expo-status-bar';
import auth from '@services/auth.service';
import {useSelector} from 'react-redux';
import {RootState} from '@redux/store';
import {
  logoutUser,
  setCurrentRoleFan,
  setCurrentRoleScanner,
} from '../redux/slices/authSlice';
import {useAppDispatch} from '../redux/hooks';
import {retrieveEvents, sortEvents} from '@redux/slices/eventSlice';
import {
  redeemTicketsRetrievedSinceConnectionLost,
  retrieveAllTickets,
} from '@redux/slices/ticketSlice';
import storageService from '@services/storage.service';

// interface AuthContextType {
//   onLogout: () => void;
//   user: any;
// }

export default function EventsScreen({navigation, route}) {
  const user = useSelector((state: RootState) => state.auth.user);

  const timeConnectionlost = useSelector(
    (state: RootState) => state.network.timeConnectionlost,
  );

  const dispatch = useAppDispatch();

  const [selectedEvent, setSelectedEvent] = useState('');
  // const [events, setEvents] = useState([]); // TODO: CHANGE TO USE TS
  // const [canScan, setCanScan] = useState<boolean>(false);
  const [visible, setVisible] = useState(true);
  const canScan = useSelector((state: RootState) => state.auth.canScan);
  const events = useSelector((state: RootState) => state.event.filteredEvents);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const currentRole = useSelector((state: RootState) => state.auth.currentRole);

  // useFocus effect here to ensure API call is made when navigation.goBack() is called, as by default navigation.goBack() did not trigger rerender
  useFocusEffect(
    React.useCallback(() => {
      dispatch(retrieveEvents());
      dispatch(retrieveAllTickets());
    }, [currentRole]),
  );

  return (
    <Background>
      <StatusBar
        animated={true}
        backgroundColor={theme.colors.background}
        style="light"
      />
      <TouchableOpacity
        onPress={() => {
          dispatch(logoutUser());
        }}
        style={styles.container}>
        <Text style={styles.tabText}>Sign Out</Text>
      </TouchableOpacity>
      <LogoSmall />
      {/* Only shows if user has role which allows them to scan tickets*/}
      {canScan === true && (
        <View style={styles.tabContainer}>
          <Text
            style={styles.tabText}
            onPress={() => {
              dispatch(setCurrentRoleScanner());
            }}>
            My Events
          </Text>
          <Text
            style={styles.tabText}
            onPress={() => {
              dispatch(setCurrentRoleFan());
            }}>
            My Tickets
          </Text>
        </View>
      )}
      <Text style={styles.header}>Hi!</Text>
      <FadeInOut visible={visible}>
        <View style={styles.tabContainer}>
          {currentRole === 'scanner' ? (
            <Text style={styles.text}> To start scanning select event</Text>
          ) : (
            <Text style={styles.text}> Select Event to Show Tickets for</Text>
          )}
        </View>
        <Searchbar
          placeholder="Search for a event or artist"
          onChangeText={(text: string) =>
            dispatch(sortEvents(text), setSelectedEvent(text))
          }
          value={selectedEvent}
          iconColor="white"
          style={styles.searchbar}
          placeholderTextColor="white"
          theme={{
            colors: {
              placeholder: 'white',
              text: 'white',
              primary: 'white',
            },
          }}
        />
      </FadeInOut>
      <FadeInOut
        visible={visible}
        style={{flex: 1, width: '100%', overflow: 'hidden'}}>
        {events && ( // so that only shows when events are defined
          <ScrollView style={styles.eventContainer}>
            {events.map(event => (
              <ListItem
                onPress={() => {
                  if (currentRole === 'scanner') {
                    navigation.navigate('ScannerScreen', {event});
                  } else {
                    navigation.navigate('TicketsScreen', {event});
                  }
                }}
                containerStyle={styles.event}
                key={event.id}>
                <View>
                  <Text style={styles.eventDay}>{event.date.day}</Text>
                  <View style={styles.monthAndYearContainer}>
                    <Text style={styles.eventMonth}>{event.date.month}</Text>
                    <Text style={styles.eventYear}>{event.date.year}</Text>
                  </View>
                </View>
                <View style={{display: 'flex', flex: 1}}>
                  <Text style={styles.eventTitle} numberOfLines={1}>
                    {event.name}
                  </Text>
                  <Text style={styles.eventVenue}>{event.venue}</Text>
                  <Text style={styles.eventCity}>{event.city}</Text>
                </View>
              </ListItem>
            ))}
          </ScrollView>
        )}
        {/* <TouchableOpacity
          onPress={() => {
            dispatch(redeemTicketsRetrievedSinceConnectionLost());
          }}
          style={styles.container}>
          <Text style={styles.tabText}>TEST</Text>
        </TouchableOpacity> */}
      </FadeInOut>
    </Background>
  );
}

const styles = StyleSheet.create({
  // styles for tab to select My Tickets or My Events
  tabContainer: {
    display: 'flex',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  tabText: {
    color: 'white',
    fontSize: 20,
    textDecorationLine: 'underline',
  },
  container: {
    position: 'absolute',
    top: 7, //aligned with logo
    right: 4,
  },
  image: {
    width: 24,
    height: 24,
  },
  header: {
    color: 'white',
    marginRight: 'auto',
    paddingHorizontal: 0,
    fontSize: 24,
    fontWeight: 'bold',
    paddingVertical: 12,
  },
  text: {
    color: 'white',
    marginRight: 'auto',
    paddingHorizontal: 0,
    fontSize: 18,
    marginBottom: 12,
  },
  searchbar: {
    marginTop: 0,
    backgroundColor: '#0A0909',
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    marginBottom: '10%',
    width: '100%',
  },

  eventContainer: {
    backgroundColor: '#0A0909',
    width: '100%',
    marginBottom: 60,
  },

  event: {
    backgroundColor: '#0A0909',
    borderColor: 'white',
    borderWidth: 1,
    margin: 10,
  },

  eventTitle: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
  },

  eventVenue: {color: 'white', fontSize: 16, marginBottom: 5},
  eventCity: {color: 'white', fontSize: 12},

  eventDay: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    paddingBottom: 4,
    textAlign: 'center',
  },
  eventMonth: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 2,
  },
  eventYear: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  monthAndYearContainer: {
    paddingTop: 6,
    borderTopColor: 'white',
    borderTopWidth: 1,
    display: 'flex',
    flexDirection: 'row',
  },
});
