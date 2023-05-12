import { i18n, LocalizationKey } from "@/Localization";
import React, {useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, FlatList } from "react-native";
import { User } from "@/Services";
import { Icon } from "@/Theme/Icon/Icon";
import { HomeStackParamList } from "./HomeContainer";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MapView, {Callout, Marker, Polyline} from 'react-native-maps';
import { Colors, FontSize, FontWeight } from "@/Theme/Variables";
import { Divider, Pressable, ScrollView } from 'native-base';
import Header from "@/Components/Header";
import Busstop from "@/Components/Home/Busstop";
import { Status } from "@/Components/Header";
import { debounce } from 'lodash';
import * as Location from 'expo-location';


import axios from 'axios'

type HomeScreenNavigationProps = NativeStackScreenProps<
  HomeStackParamList,
  'Home'
>
export interface IHomeProps {
  data: User | undefined;
  isLoading: boolean;
}
export const Home = ({ route, navigation }: HomeScreenNavigationProps) => {
  const { data, isLoading } = route.params;
  const [openHeader, setOpenHeader] = useState(true)
  const [nearbusOpen, setNearbusOpen] = useState(false);
  const [mapRegion, setMapRegion] = useState({
    latitude: 10.880035901459214,
    longitude: 106.80625226368548,
    latitudeDelta: 0.015,
    longitudeDelta: 0.0121,
  });
  const [dataBusStop, setDataBusStop] = useState<any[]>([])  
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      let location : any = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);



  const getDataBusTop = async () => {
    axios.get(`http://apicms.ebms.vn/businfo/getstopsinbounds/${mapRegion.longitude - mapRegion.longitudeDelta}/${mapRegion.latitude - mapRegion.latitudeDelta}/${mapRegion.longitude + mapRegion.longitudeDelta}/${mapRegion.latitude + mapRegion.latitudeDelta}`)
      .then(res => {
        setDataBusStop(res.data)
      })
      .catch(err => console.log(err)) 
    }

  useEffect(() => {
    getDataBusTop()
  }, [])
  console.log(location)
  // console.log(mapRegion)
  return (
    <View style={styles.container}>
    <MapView
        style={styles.map}
        region={mapRegion}
        // moveOnMarkerPress = {false}
        onRegionChangeComplete={debounce(
          (region, details) => { 
            if((region.latitude.toFixed(6) == mapRegion.latitude.toFixed(6)
            && region.longitude.toFixed(6) == mapRegion.longitude.toFixed(6))){
              return;
            }
            // console.log('no bi zo cai nay ne')
              setMapRegion(region)
              getDataBusTop()
          }, 300)
        }
        showsUserLocation={true}
        customMapStyle={[
          {
            "featureType": "poi.business",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "transit.station",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "transit.station",
            "elementType": "geometry",
            "stylers": [
              {
                "visibility": "off"
              }
            ]
          },
          {
            "featureType": "transit.station",
            "elementType": "geometry.fill",
            "stylers": [
              {
                "color": "#dfd2ae"
              }
            ]
          }
        ]}
      >
        {
          location &&
          <Marker
            coordinate={{latitude: location.latitude, longitude: location.longitude}}
          />
        }
        {
          dataBusStop.map((item, index) => 
            <Marker
              key={index}
              coordinate={{
                latitude: item.Lat,
                longitude: item.Lng,
              }}
              tracksViewChanges={false}
              image={require('@/../assets/image/markicon-bus.png')}
            >
              <Callout style={{width: 200}}>
                  <Text style={{fontSize: 13, fontWeight: '700'}}>{item.Code} - {item.Name}</Text>  
                  <Text style={{fontSize: 11}}>{item.AddressNo}, {item.Street}, {item.Zone}</Text> 
                  <Text style={{fontSize: 12, fontWeight: '600'}}>Tuyến xe: {item.Routes}</Text>
              </Callout>
            </Marker>
          )
        }
      </MapView>
      
              {/* <Callout style={{maxWidth: 200}}>
                  <Text style={{fontSize: 13, fontWeight: '700'}}>{item.Code} - {item.Name}</Text>  
                  <Text style={{fontSize: 11}}>{item.AddressNo}, {item.Street}, {item.Zone}</Text> 
                  <Text style={{fontSize: 12, fontWeight: '600'}}>Tuyến xe: {item.Routes}</Text>
              </Callout> */}
            {/* </Marker> */}
      {
        openHeader ? (
          <>
            <Header cover={Status.COVER1} leftTitle="TP. Hồ Chí Minh" leftIconName="location" logoShow={true} rightIconName="up"
              onPressRightIcon={() => setOpenHeader(!openHeader)}
            />

            <View style={styles.options}>
              <TouchableOpacity style = {{width: '45%', alignItems:'center', justifyContent: 'center'}} onPress={() => navigation.navigate('FindRoute', {status: 'FindRoute'})}>
                  <Icon name='findroute' size={24} color={Colors.PRIMARY40} />
                  <Text style={[styles.tbuttonsm, {marginTop: 6}]}>Tìm đường</Text>
              </TouchableOpacity>
              
              <View style = {{height:'100%', alignItems:'center', justifyContent:'center'}}>
                <Divider bg={Colors.BLACK30} thickness="2" mx="2" orientation="vertical" height={'80%'} />
              </View>

              <TouchableOpacity style={{ width: '45%', alignItems: 'center', justifyContent: 'center' }} onPress={() => navigation.navigate('FindRoute', {status: 'LookUp'})}>
          <Icon name = 'magnifying' size={24} color={Colors.PRIMARY40} />
          <Text style={[styles.tbuttonsm, {marginTop: 6}]}>Tra cứu</Text>
        </TouchableOpacity>

            </View>
          </>
        ) : (
          <TouchableOpacity style={{
            zIndex: 6, alignItems: 'center', position: 'absolute',
            justifyContent: 'center', width: 40, height: 40,
            borderRadius: 40, backgroundColor: Colors.PRIMARY40,
            top: 36, right: 0,
            margin: 10
          }}
            onPress={() => {setOpenHeader(!openHeader)}}
          >
            {
              <View style={{top: -2}}>
                  <Icon name={'down'} size={20} color='black' />
              </View>
            }     
        </TouchableOpacity>
        )
      }

      {
        nearbusOpen ?
          <View style={styles.listbusnear}>
            <Divider bg={Colors.BLACK30} thickness="3" width={'20%'} orientation="horizontal" marginY={3} marginX={10} />
            <View style={{
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'flex-end', width: '100%',
              borderBottomColor: Colors.BLACK30, borderBottomWidth: 1,
              paddingHorizontal: '10%',
              paddingBottom: 10,
              marginTop: -12
            }}>
              <Icon name='map' size={20} color='#334155' />
              <Text style={{
                fontSize: FontSize.BODY_LARGE,
                fontWeight: FontWeight.BUTTON_NORMAL,
                top: 1
              }}>Trạm dừng gần đây 
              </Text>

              <Pressable onPress={() => setNearbusOpen(!nearbusOpen)}>
                <Icon name='close' size={20} color='#334155' />
              </Pressable>
            </View>
            
            <View style={{width:'80%', marginBottom: 40 }}>
                {
                  <FlatList
                  data={dataBusStop}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => setMapRegion({...mapRegion, latitude: item.Lat-0.000001, longitude: item.Lng})} >
                      <Busstop name={item.Name} address={item.AddressNo}
                        buslist={item.Routes}
                        street={item.Street} zone={item.Zone}
                      />
                    </TouchableOpacity>
                  )}
                  keyExtractor={item => item.StopId}
                  />
                }
            </View>
          </View>  
          :
          <>
            <TouchableOpacity style={styles.nearbusBTN} onPress={() => setNearbusOpen(!nearbusOpen)}>
              <Icon name='map' size={24} color='black' />
              <Text style={[styles.tbuttonsm, { marginLeft: 8 }]}>Trạm dừng gần đây</Text> 
            </TouchableOpacity>
          </>
      }

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:Colors.SECONDARY20
  },
  statusBar: {
    width: '100%',
    backgroundColor: Colors.SECONDARY20,
    height: 36, position: 'absolute',
    zIndex: 5
  },
  coverImg: {
    position: 'absolute', zIndex: 5, width: Dimensions.get('window').width,
    height: Dimensions.get('window').width / 3.5, top: 36
  },
  map: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    zIndex: 0
  },
  tbuttonsm: {
    fontSize: FontSize.BUTTON_NORMAL,
    fontWeight: FontWeight.BUTTON_NORMAL,
  },
  options: {
    zIndex: 10, flexDirection: 'row',
    width: Dimensions.get('window').width - 40,
    justifyContent: 'center',
    borderRadius: 5,
    position: 'absolute', top: 110,
    backgroundColor: "white", height: 70,
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nearbusBTN: {
    zIndex: 5, bottom: 20, position: 'absolute', flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 8, borderWidth: 1, borderColor: '#ccc',
    shadowColor: "#000",
    shadowOffset: {
    width: 0,
    height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  listbusnear: {
    zIndex: 5, maxHeight: 300, bottom: 0, position: 'absolute',
    width: Dimensions.get('window').width,
    flexDirection: 'column', alignItems: 'center', alignSelf: 'center',

    backgroundColor: 'white',
    borderTopLeftRadius: 15, borderTopRightRadius: 15,
    borderWidth: 1, borderColor: Colors.BLACK30
  }
});
