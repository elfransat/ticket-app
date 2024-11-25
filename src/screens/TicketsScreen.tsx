import React, {useEffect, useState} from 'react';
import Background from '@components/Background';
import {LogoSmall} from '@components/Logo';
import ticketService from '../services/ticket.service';
import {theme} from '@config/theme';
import {Text, Searchbar} from 'react-native-paper';
import QRCode from '@components/QRCode';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  Alert,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {ListItem, Avatar} from 'react-native-elements';
import {useAppSelector} from '@redux/hooks';
import {RootState} from '@redux/store';
import {useAppDispatch} from '../redux/hooks';
import {
  retrieveTickets,
  setCurrentTicketsState,
} from '@redux/slices/ticketSlice';
import {useSelector} from 'react-redux';

export default function TicketsScreen({navigation, route}) {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const tickets = useSelector(
    (state: RootState) => state.ticket.currentTickets,
  );
  const [filteredTickets, setFilteredTickets] = useState();
  const dispatch = useAppDispatch();
  const eventID = route.params.event.id;

  // const [tickets, setTickets] = useState([]); // TODO: CHANGE TO USE TS
  const [ticketEnabled, setTicketEnabled] = useState(false);

  let MyDate = new Date();
  let MyDateString;

  MyDate.setDate(MyDate.getDate());

  MyDateString =
    ('0' + MyDate.getDate()).slice(-2) +
    ('0' + (MyDate.getMonth() + 1)).slice(-2);
  // const ticketFetcher = () =>
  //   ticketService
  //     .retrieveTickets(eventID, user.uid)
  //     .then((response: any) => {
  //       if (response.data.length === 0) {
  //         navigation.goBack();
  //       } else {
  //         usableTicketCheck(response.data);
  //         // if (MyDateString === response.data[0].event_start) {
  //         //   setTicketEnabled(true);
  //         // }
  //       }
  //     })
  //     .catch(function (error) {
  //       console.log(error.response);
  //     });

  const usableTicketCheck = tickets => {
    //for (i = 0; i < tickets.length, i++)
    tickets.forEach(ticket => {
      if (MyDateString === ticket.event_start) {
        ticket.valid = true;
      } else if (ticket.redeemed || MyDateString !== ticket.event_start) {
        ticket.valid = false;
      } else {
        ticket.valid = false;
      }
    });
    setTickets(tickets);
  };

  useEffect(() => {
    // ticketFetcher();
    // // checkDate();

    // const interval = setInterval(() => {
    //   ticketFetcher();
    // }, 2000);

    // return () => clearInterval(interval);

    dispatch(retrieveTickets(eventID));
  }, []);

  return (
    <Background>
      <StatusBar
        animated={true}
        backgroundColor={theme.colors.background}
        style="light"
      />
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
          dispatch(setCurrentTicketsState([]));
        }}
        style={styles.container}>
        <Image
          style={styles.image}
          source={require('@assets/arrow_back.png')}
        />
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          width: '110%',
          overflow: 'hidden',
          marginTop: 30,
          marginBottom: 60,
        }}>
        <ScrollView>
          {tickets.map(ticket => (
            <ListItem
              containerStyle={styles.ticket}
              key={ticket.id}
              // onLongPress={() => {
              //   console.log('hi');
              // }}
              // onPressOut={() => {
              //   console.log('bye');
              // }}
              // CAN BE USED TO UNBLUR TICKET ONPRESS
            >
              <View style={styles.ticketContainer}>
                <View style={styles.ticketBanner}></View>
                <View style={styles.ticketContent}>
                  <Text style={styles.title}>{ticket.name}</Text>
                  <View style={styles.date}>
                    <Image source={require('@assets/calendar.png')}></Image>
                    <Text style={styles.iconText}>{ticket.date}</Text>
                  </View>
                  <View style={styles.location}>
                    <Image source={require('@assets/pin.png')}></Image>
                    <Text style={styles.iconText}>{ticket.venue}</Text>
                  </View>
                  <View style={styles.barcodeContainer}>
                    <View style={styles.barcode}>
                      <QRCode
                        code={ticket.code}
                        size={200}
                        enabled={ticket.redeemed}
                      />
                    </View>
                    <Text style={styles.ticketID}>{ticket.code}</Text>
                  </View>
                  <View style={styles.priceSeat}>
                    <View style={styles.ticket}>
                      <Image source={require('@assets/seat.png')}></Image>
                      <Text style={styles.iconText}>
                        {ticket.type}
                        {ticket.seat && ', ' + ticket.seat}
                      </Text>
                    </View>
                    <View style={styles.ticket}>
                      <Image source={require('@assets/ticket.png')}></Image>
                      <Text style={styles.iconText}>
                        {ticket.price}
                        {ticket.currency ? ticket.currency.toUpperCase() : null}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.ticketBanner}></View>
              </View>
            </ListItem>
          ))}
        </ScrollView>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 7, //aligned with logo
    left: 4,
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
    marginBottom: 5,
  },
  ticketContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: 'white',
  },

  ticketBanner: {
    backgroundColor: 'orange',
    height: 35,
  },
  ticketContent: {
    display: 'flex',
    flexDirection: 'column',
    padding: 10,
    backgroundColor: 'black',
  },
  title: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 24,
    paddingVertical: 5,
  },
  date: {
    display: 'flex',
    flexDirection: 'row',
    paddingVertical: 10,
  },
  location: {
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 15,
  },
  barcode: {
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  barcodeContainer: {
    width: '100%',
    alignSelf: 'center',
    borderColor: 'white',
    paddingVertical: 15,
    //paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  ticketID: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  priceSeat: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
    paddingVertical: 10,
  },
  price: {
    color: 'white',
    fontSize: 16,
  },
  ticketIcon: {
    height: 24,
    width: 24,
  },
  ticket: {
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: 'black',
  },
  // aligns text away from icon
  iconText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 7,
  },
});
