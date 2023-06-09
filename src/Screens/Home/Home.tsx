import { i18n, LocalizationKey } from "@/Localization";
import React, {useCallback, useEffect, useState} from "react";
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity, FlatList, Alert, StatusBar } from "react-native";
import { User, useUpdateFavouriteMutation } from "@/Services";
import { Icon } from "@/Theme/Icon/Icon";
import { HomeStackParamList } from "./HomeContainer";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import MapView, {Callout, Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import { Colors, FontSize, FontWeight } from "@/Theme/Variables";
import { Divider, Pressable, ScrollView, Modal, Spinner } from 'native-base';
import Header from "@/Components/Header";
import Busstop from "@/Components/Home/Busstop";
import { Status } from "@/Components/Header";
import { debounce, set } from 'lodash';
import * as Location from 'expo-location';
import { useAppSelector, useAppDispatch } from "@/Hooks/redux";

import axios from 'axios'
import { CHANGE_FAVOURITE } from "@/Store/reducers/user";
import BusIconContainer from "@/Components/Home/BusIconContainer";
import { getStatusBarHeight } from "react-native-status-bar-height";

type HomeScreenNavigationProps = NativeStackScreenProps<
  HomeStackParamList,
  'Home'
>
export interface IHomeProps {
  data: User | undefined;
  isLoading: boolean;
}

const initialStation = {
  StopId: '',
  Name: '',
  Street: '',
  Zone: '',
  Routes: '',
  AddressNo: '',
}
export const Home = ({ route, navigation }: HomeScreenNavigationProps) => {
  const { data, isLoading } = route.params;
  const dispatch = useAppDispatch()
  const initMapRegion = {
    latitude: 10.880035901459214,
    longitude: 106.80625226368548,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  }
  const [mapRegion, setMapRegion] = useState(initMapRegion);
  const [dataBusStop, setDataBusStop] = useState<any[]>([])  
  const [dataNearBus, setDataNearBus] = useState<any[]>([])  
  
  const [openHeader, setOpenHeader] = useState(true)
  const [nearbusOpen, setNearbusOpen] = useState(false);
  const [modal, setModal] = useState({
    isOpen: false,
    data: initialStation
  })

  const [loading, setLoading] = useState({
    nearStation: false,
    likeStation: false,
  })

  const [fetch] = useUpdateFavouriteMutation()

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Bạn chưa cấp quyền truy cập vị trí cho ứng dụng');
        return;
      }
    })();
  }, []); 

    
  const user = useAppSelector(state => state.user.user)

  const getDataBusTop = async( latitude: number, longitude:number, latitudeDelta: number, longitudeDelta: number, firstTime = false) => {
    console.log('đang tìm trạm mới')
    console.log( latitudeDelta, longitudeDelta)
    if (latitudeDelta > 0.015 || longitudeDelta > 0.015) { 
      console.log('t ko thèm tìm')
      return
    }
    setLoading({...loading, nearStation: true})
    axios.get(`http://apicms.ebms.vn/businfo/getstopsinbounds/${longitude - longitudeDelta}/${latitude - latitudeDelta}/${longitude + longitudeDelta}/${latitude + latitudeDelta}`)
      .then(res => {
        setDataBusStop(res.data)
        console.log(res.data.length)
        if (firstTime) setDataNearBus(res.data)
        setLoading({...loading, nearStation: false})
      })
      .catch(err => console.log(err)) 
    }
  
  const handleClickHeart = async (item: any) => {
    if (user.id != '') {
      setLoading({...loading, likeStation: true})
      const station = await fetch({ route: 'station', id: item+''}).unwrap()
      const payload = { station, bus: user.favouriteBus }
      console.log(payload)
      
      dispatch(CHANGE_FAVOURITE(payload))        
      setLoading({...loading, likeStation: false})
    }
    else {
      Alert.alert(
        'Thông báo',
        'Bạn cần đăng nhập để thực hiện chức năng này.',
        [
          { text: 'OK', style: 'cancel' },
        ],
    )
    }
  }
  
  useEffect(() => {
    getDataBusTop(mapRegion.latitude, mapRegion.longitude, mapRegion.latitudeDelta, mapRegion.longitudeDelta, true)
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#DDEEF9"
        barStyle={"dark-content"}
        hidden={false}
      />
    <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        mapPadding={{ top: openHeader ? 140 : 50 , right: 10, bottom: 0, left: 0 }}
        onRegionChange={
          useCallback(
            debounce(
            (region, details) => { 
              if((region.latitude.toFixed(6) == mapRegion.latitude.toFixed(6)
              && region.longitude.toFixed(6) == mapRegion.longitude.toFixed(6))){
                return;
              }
              // console.log('no bi zo cai nay ne')
                setMapRegion(region)
                getDataBusTop(region.latitude, region.longitude, region.latitudeDelta, region.longitudeDelta)
            }, 1000, {trailing: true, leading: false}), []
          )
        }
        showsUserLocation={true}
        customMapStyle={
          [
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
        ]}
      >
        {
          dataBusStop.map((item, index) => {
              if (user.id != '' && user.favouriteStation != null && user.favouriteStation.includes(item.StopId + '')) { 
                return (
                  <Marker
                  key={index}
                  coordinate={{
                    latitude: item.Lat,
                    longitude: item.Lng,
                  }}
                  tracksViewChanges={false}
                >
                  <Image
                      source={require('@/../assets/image/markicon-bus_liked.png')}
                      style={{ width: 20, height: 20 }}
                      resizeMode="contain"
                  />
                  <Callout style={{ width: 200, flexDirection: 'column' }} onPress={() => setModal({isOpen: true, data: item})}>
                      <Text style={{fontSize: 13, fontWeight: '700'}}>{item.StopId} - {item.Name}</Text>  
                      <Text style={{fontSize: 11}}>{item.AddressNo}, {item.Street}, {item.Zone}</Text> 
                      <Text style={{fontSize: 12, fontWeight: '600'}}>Tuyến xe: {item.Routes != '' ? item.Routes : 'Tạm dừng khai thác'}</Text>
                      <Text style={{fontSize: 10, color: Colors.PRIMARY40}}>Nhấn vào đây để xem thêm thông tin.</Text>
                  </Callout>
                </Marker>
                )
              } 
              else return (
                <Marker
                key={index}
                coordinate={{
                  latitude: item.Lat,
                  longitude: item.Lng,
                }}
                tracksViewChanges={false}
                >
                  <Image
                      source={require('@/../assets/image/markicon-bus.png')}
                      style={{ width: 20, height: 20 }}
                      resizeMode="contain"
                  />
                <Callout style={{ width: 200, flexDirection: 'column' }} onPress={() => setModal({isOpen: true, data: item})}>
                    <Text style={{fontSize: 13, fontWeight: '700'}}>{item.StopId} - {item.Name}</Text>  
                    <Text style={{fontSize: 11}}>{item.AddressNo}, {item.Street}, {item.Zone}</Text> 
                    <Text style={{fontSize: 12, fontWeight: '600'}}>Tuyến xe: {item.Routes != '' ? item.Routes : 'Tạm dừng khai thác'}</Text>
                    <Text style={{fontSize: 10, color: Colors.PRIMARY40}}>Nhấn vào đây để xem thêm thông tin.</Text>
                </Callout>
              </Marker>
              )
            }
          )
        }
      </MapView>
      {
        openHeader ? (
          <>
            <Header cover={Status.COVER1} leftTitle="Hồ Chí Minh" leftIconName="location" logoShow={true} rightIconName="up"
              onPressLeftIcon={() => Alert.alert(
                'Thông báo',
                'EasyBus đang trong giai đoạn phát triển, hiện tại chỉ hỗ trợ khu vực TP.HCM.',
                [
                  { text: 'OK', style: 'cancel' },
                ],
              )}
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
            top: 0, right: 0,
            margin: 10,
            marginRight: 20,
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
      <Text style={{ fontSize: 11, color: '#999', top: openHeader ? 145 - (Dimensions.get('window').width / 3.5) : 5, textAlign:'center'}}>Nhấn vào trạm dừng trên bản đồ để xem thông tin.</Text>
      <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, data: initialStation })}
        avoidKeyboard justifyContent="flex-end"
        bottom="4" size="lg">
        <Modal.Content>
          <Modal.CloseButton />
          
          <Modal.Header w={'90%'}>{modal.data.StopId + ' - ' + modal.data.Name}</Modal.Header>
          
          <Modal.Body>
            <ScrollView  horizontal={true} style = {{flexDirection:'row'}}>
              {
                modal.data.Routes != '' ? modal.data.Routes.split(', ').map((item, index) =>
                  <View key={index}>
                    <BusIconContainer busnum={item} />
                  </View>
                )
                  : 
                  <Text style={{color: Colors.PRIMARY40, fontWeight: '500'}}>Trạm dừng khai thác</Text>
              }
            </ScrollView>
            <Text style = {{fontSize: 13, fontWeight:'500'}}>
              {modal.data.AddressNo}, {modal.data.Street}, {modal.data.Zone}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent:'space-around', marginTop: 10}}>
              <TouchableOpacity style = {{width: '40%', alignItems:'center',
                borderRadius:4, borderWidth:1, borderColor:Colors.BLACK60
              }}
              onPress={() => handleClickHeart(modal.data.StopId)}
              >
                {
                  loading.likeStation ? 
                    <View style={{top: 10}}>
                      <Spinner size="sm" color={Colors.PRIMARY40} />
                    </View> :
                    user != null && user.favouriteStation.includes(modal.data.StopId + '') ? 
                    <View>
                      <View style={{top: 10}}>
                        <Icon name='heart' size={20} color={Colors.PRIMARY40} />
                      </View>
                      <View style={{top: -10}}>
                        <Icon name='heart-o' size={21} color={'#262626'} />
                      </View>
                    </View>
                    :
                    <View style = {{top: 10}}>
                      <Icon name='heart-o' size={20} color='black' />
                    </View>
                }
              </TouchableOpacity>
              <TouchableOpacity style = {{width: '40%', alignItems:'center', padding: 10,
                borderRadius:4, borderWidth:1, borderColor: Colors.BLACK60
            }}
                onPress={() => { 
                  setMapRegion(initMapRegion)
                  setDataBusStop([])
                  navigation.navigate('FindRoute', { status: 'FindRoute', target: modal.data })
                } 
              }
            >
                  <Icon name='findroute' size={24} color={Colors.PRIMARY40} />
              </TouchableOpacity>
            </View>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      
      {
        loading.nearStation && 
          <View style={{ zIndex: 10, top: 40, width: '100%' }}>
            <Spinner size="lg" color="indigo.500" />
          </View>
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
                  data={dataNearBus}
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
            <Pressable style={styles.nearbusBTN} onPress={() => setNearbusOpen(!nearbusOpen)}>
              <Icon name='map' size={24} color='black' />
              <Text style={[styles.tbuttonsm, { marginLeft: 8 }]}>Trạm dừng gần đây</Text> 
            </Pressable>
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
    position: 'absolute', 
    top: 74 ,
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
    zIndex: 5, bottom: 16, position: 'absolute', flexDirection: 'row', alignItems: 'center', alignSelf: 'center',
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
