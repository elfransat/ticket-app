import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import {Camera} from 'expo-camera';
import Button from '@components/Button';
import {theme} from '@config/theme';
import {StatusBar} from 'expo-status-bar';
import {useAppSelector} from '@redux/hooks';
import {RootState} from '@redux/store';
import {useAppDispatch} from '@redux/hooks';
import {
  validateTicket,
  clearTicket,
  setScanned,
  redeemTicket,
  validateTicketShort,
} from '@redux/slices/ticketSlice';
import TextInput from '@components/TextInput';
import Validator from '@services/authValidator';

interface ManualSearch {
  code: string;
  error: string;
}

export default function ScannerScreen({navigation, route}) {
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  // const [scanned, setScanned] = useState<boolean>(false);
  const [manualSearch, setManualSearch] = useState<ManualSearch>({
    code: '',
    error: '',
  });

  const scannedTicket = useAppSelector(
    (state: RootState) => state.ticket.scannedTicket,
  );

  const dispatch = useAppDispatch();

  useEffect(() => {
    (async () => {
      const {status} = await Camera.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    dispatch(clearTicket()); // clears ticket on launch
  }, []);

  const handleBarCodeScanned = async data => {
    // dispatch(setScanned());
    //type not defined as module does not seem compatible with typescript
    // setTicket({...ticket, code: data.data}); // changes state of data to value retrieved from scanning - allows it to be used by redeem function
    // setScanned(true);
    // ticket is assigned here due to setState being asynchronous and causing an issue in validateTicket
    const ticket = {
      code: data.data,
      eventID: route.params.event.id,
    };
    await dispatch(validateTicket(ticket));
  };

  return (
    <View style={styles.scannerContainer}>
      <TouchableOpacity
        onPress={() => {
          navigation.goBack();
        }}
        style={styles.container}>
        <Image
          style={styles.image}
          source={require('@assets/arrow_back.png')}
        />
      </TouchableOpacity>
      <StatusBar
        animated={true}
        backgroundColor={theme.colors.background}
        style="light"
      />
      <TouchableOpacity
        onPress={() => {
          setModalVisible(true);
          dispatch(clearTicket());
          setManualSearch({...manualSearch, code: '', error: ''});
        }}
        style={styles.searchButton}>
        <Text style={{color: 'white', fontSize: 22}}>Search</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Enter the first 6 digits of QR Code
            </Text>
            <TextInput
              label="Code"
              returnKeyType="next"
              value={manualSearch.code}
              placeholder="Code"
              error={!!manualSearch.error}
              errorText={manualSearch.error}
              onChangeText={(text: string) =>
                setManualSearch({...manualSearch, code: text})
              }
              autoCapitalize="none"
            />
            <View style={styles.modalButtonsContainer}>
              <Button
                uppercase={false}
                style={styles.buttonScan}
                onPress={() => {
                  const manualSearchError = Validator.shortcode(
                    manualSearch.code,
                  );

                  if (manualSearchError) {
                    setManualSearch({
                      ...manualSearch,
                      error: manualSearchError,
                    });
                  } else {
                    dispatch(
                      validateTicketShort({
                        code: manualSearch.code,
                        eventID: route.params.event.id,
                      }),
                    );
                    setManualSearch({
                      code: '',
                      error: '',
                    });
                    setModalVisible(false);
                  }
                }}>
                Scan Code
              </Button>
              <Button
                uppercase={false}
                style={styles.buttonScan}
                onPress={() => {
                  setModalVisible(false);
                  setManualSearch({...manualSearch, code: '', error: ''});
                }}>
                Close
              </Button>
            </View>
          </View>
        </View>
      </Modal>
      <Camera
        onBarCodeScanned={
          scannedTicket.scanned ? undefined : handleBarCodeScanned
        }
        style={{
          width: Dimensions.get('screen').width,
          height: '60%',
        }}
      />
      <View style={styles.ticketContainer}>
        <Text style={styles.text}>Ticket Information</Text>
        <View style={styles.ticketInformationContainer}>
          {scannedTicket.type !== '' && (
            <Text style={styles.ticketType}>
              Ticket Type: {scannedTicket.type}
              {scannedTicket.seat && <Text> , {scannedTicket.seat}</Text>}
            </Text>
          )}
        </View>
        <View
          style={
            scannedTicket.loading
              ? styles.ticketStatusContainer
              : !scannedTicket.scanned
              ? styles.ticketStatusContainer
              : scannedTicket.redeemed
              ? styles.ticketStatusContainerRedeemed
              : scannedTicket.isValid
              ? styles.ticketStatusContainerValid
              : styles.ticketStatusContainerInvalid
          }>
          {scannedTicket.loading ? (
            <Text style={styles.statusTextAwaitingOrInValid}>Loading...</Text>
          ) : !scannedTicket.scanned ? (
            <Text style={styles.statusTextAwaitingOrInValid}>
              Awaiting Ticket...
            </Text>
          ) : scannedTicket.redeemed ? (
            <Text style={styles.statusTextValid}>Ticket Already Redeemed</Text>
          ) : scannedTicket.isValid ? (
            <Text style={styles.statusTextValid}>Ticket Is Valid</Text>
          ) : (
            <Text style={styles.statusTextAwaitingOrInValid}>
              Ticket Is Not Valid
            </Text>
          )}
        </View>
        <View style={styles.buttonContainer}>
          <Button
            uppercase={false}
            style={styles.buttonScan}
            onPress={() => {
              // setScanned(false);
              dispatch(clearTicket());
            }}>
            Scan New
          </Button>
          <Button
            uppercase={false}
            disabled={
              scannedTicket.isValid && !scannedTicket.redeemed ? false : true
            }
            style={
              scannedTicket.isValid && !scannedTicket.redeemed
                ? styles.buttonRedeem
                : styles.buttonRedeemDisabled
            }
            onPress={() => {
              dispatch(redeemTicket(route.params.event.id));
            }}>
            Redeem Ticket
          </Button>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50, //aligned with logo
    left: 35,
    zIndex: 100,
  },
  image: {
    width: 24,
    height: 24,
  },
  scannerContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '100%',
  },
  searchButton: {
    position: 'absolute',
    top: 45, //aligned with logo
    right: 25,
    zIndex: 100,
    borderColor: 'white',
    borderBottomWidth: 1,
  },
  camera: {
    height: '60%',
    width: '100%',
  },
  button: {
    backgroundColor: theme.colors.secondary,
    color: 'white',
  },
  text: {
    alignItems: 'center',
    display: 'flex',
    color: 'white',
    textAlign: 'left',
    fontSize: 24,
    marginTop: '4%',
    marginBottom: '2%',
  },
  ticketInfo: {
    marginBottom: 'auto',
  },
  /////
  ///  button styling
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: 10,
  },

  buttonScan: {
    backgroundColor: 'black',
    borderWidth: 2,
    borderColor: 'white',
    width: '40%',
    marginRight: 10,
  },
  buttonRedeem: {
    backgroundColor: theme.colors.primary,
    width: '50%',
  },
  buttonRedeemDisabled: {
    backgroundColor: 'gray',
    width: '50%',
  },
  ///
  /////
  ticketContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    //alignItems: ,
    height: 400,
    justifyContent: 'flex-start',
    marginHorizontal: '5%',
  },

  ticketInformationContainer: {
    backgroundColor: 'white',
    width: '90%',
    height: '20%',
    paddingLeft: 5,
    paddingTop: 10,
  },
  ticketStatusContainer: {
    marginTop: '3%',
    backgroundColor: 'yellow',
    width: '90%',
    height: '15%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  ticketStatusContainerRedeemed: {
    marginTop: '3%',
    backgroundColor: 'orange',
    width: '90%',
    height: '15%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  ticketStatusContainerValid: {
    marginTop: '3%',
    backgroundColor: 'green',
    width: '90%',
    height: '15%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  ticketStatusContainerInvalid: {
    marginTop: '3%',
    backgroundColor: 'red',
    width: '90%',
    height: '15%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  statusTextAwaitingOrInValid: {
    fontSize: 24,
    marginLeft: 5,
    color: 'black',
    fontWeight: 'bold',
  },
  statusTextValid: {
    fontSize: 24,
    marginLeft: 5,
    color: 'white',
    fontWeight: 'bold',
  },

  ticketIDStyle: {
    fontSize: 20,
  },
  ticketType: {
    fontSize: 20,
  },
  eventNameStyle: {
    fontSize: 24,
    fontWeight: 'bold',
  },

  /* -------------------------------------------------------------------------- */
  /*                                Modal Styling                               */
  /* -------------------------------------------------------------------------- */

  modalButtonsContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'center',
  },

  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    position: 'absolute',
    top: 150,
    margin: 20,
    backgroundColor: 'black',
    borderColor: 'white',
    borderWidth: 2,
    paddingHorizontal: 35,
    paddingVertical: 20,
    width: '100%',
    height: 250,
    //alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  openButton: {
    backgroundColor: '#F194FF',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
  },

  modalText: {
    alignItems: 'center',
    display: 'flex',
    color: 'white',
    textAlign: 'left',
    fontSize: 20,
    marginBottom: '2%',
  },
});
