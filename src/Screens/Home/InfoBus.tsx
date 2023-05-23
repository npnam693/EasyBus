import { View, Text, StyleSheet, Dimensions, ScrollView, Alert } from 'react-native'
import Header, { Status } from '../../Components/Header'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { HomeStackParamList } from './HomeContainer'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Divider } from 'native-base'
import BusSearchItem from '@/Components/Home/BusSearchItem'
import { useAppDispatch, useAppSelector } from '@/Hooks/redux'
import { useUpdateFavouriteMutation } from '@/Services'
import { CHANGE_FAVOURITE } from '@/Store/reducers'

type InfoBusNavigationProps = NativeStackScreenProps<
    HomeStackParamList,
    'BusInfo'
>

export default function InfoBus({ route, navigation }: InfoBusNavigationProps) {
    const user = useAppSelector(state => state.user.user)
    const [data, setData] = useState<any>()
    const [fetch] = useUpdateFavouriteMutation()
    const dispatch = useAppDispatch()

    const handleClickHeartStation = async (RouteNo: string) => {
        if (user.id != '') {
            // if (loading.clickLike) {
            //     Alert.alert(
            //         'Thông báo',
            //         'Bạn đã thực hiện thao tác này quá nhanh, vui lòng thử lại trong giây lát.',
            //         [
            //           { text: 'OK', style: 'cancel' },
            //         ],
            //     )
            //     return
            // }
            // loading.clickLike = true
            fetch({ route: 'bus', id: RouteNo + '' }).unwrap()
            .then(res => {
                const payload = { station: user.favouriteStation, bus: res }
                dispatch(CHANGE_FAVOURITE(payload))
            })
            .catch(err => console.log(err))
            // loading.clickLike = false
        }
        else {
            Alert.alert(
                'Thông báo',
                'Bạn cần phải đăng nhập để thực hiện chức năng này.',
                [
                  { text: 'OK', style: 'cancel' },
                ],
            )
        }
    }

    useEffect(() => {
        axios.get(`http://apicms.ebms.vn/businfo/getroutebyid/${route.params.data}`)
            .then(res => setData(res.data))
            .catch(err => console.log(err))
    }, [])
    
    const Tickets = data ? getFareTickets(data.Tickets) : []

    return <View style = {{marginBottom: 120}}>
        <View style = {{position:'relative'}}>
            <Header cover={Status.COVER1} leftTitle="Back" leftIconName="back" logoShow navigation={navigation}/>
        </View>

        <View style={{
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
        }}>
            {
                data && <BusSearchItem busNo={data.RouteNo} busName={data.RouteName} onClickHeart={() => {
                    handleClickHeartStation(data.RouteNo)
               }} />
            }
        </View>
        
        {
            data &&
            <ScrollView style={styles.container}>
                    <View style = {{flexDirection:'row', justifyContent:'space-between', marginTop: 4, marginLeft:20, marginRight: 20, marginBottom: 20}}>
                        <View style={{alignItems:'center'}}>
                            <Text>Vé lượt</Text>
                            <Text style={{fontSize:12, fontWeight:'600'}}>{Tickets[0]}</Text>
                        </View>   
                        <Divider orientation="vertical"/>
                        <View style={{alignItems:'center'}}>
                            <Text>Vé HSSV</Text>
                            <Text style={{fontSize:12, fontWeight:'600'}}>{Tickets[1]}</Text>
                        </View>   
                    <Divider orientation="vertical"/>
                    <View style={{alignItems:'center'}}>
                        <Text>Vé tập</Text>
                        <Text style={{fontSize:12, fontWeight:'600'}}>{Tickets[2]}</Text>
                    </View>   
                </View> 
                <View style={styles.item}>
                    <Text style={styles.header}>Mã số tuyến:    
                    </Text>
                        <Text style={styles.content}>
                        {data.RouteId}
                    </Text>
                </View>

                
                <View style = {styles.item}>
                    <Text style = {styles.header} >Cự ly: 
                    </Text>
                    <Text style={styles.content}>
                        {data.Distance}m
                    </Text>
                </View>
                    
                <View style = {styles.item}>
                    <Text style = {styles.header} >Thời gian hoạt động:
                    </Text> 
                    <Text style={styles.content}>
                        {data.OperationTime}
                    </Text>
                </View>
                    
                <View style = {styles.item}>
                    <Text style = {styles.header} >Thời gian tuyến đường:
                    </Text>   
                    <Text style={styles.content}>
                        {data.TimeOfTrip} phút
                    </Text>
                </View>
                    
                <View style = {styles.item}>
                    <Text style = {styles.header} >Giãn cách chuyến:
                    </Text>     
                    <Text style={styles.content}>
                        {data.TimeOfTrip} phút
                    </Text>
                </View>
                    
                <View style = {styles.item}>
                    <Text style = {styles.header}>Đơn vị đảm nhận: 
                        <Text style={styles.content}>
                            {data.Orgs.slice(0, data.Orgs.length-5)}
                        </Text>
                    </Text>
                </View>

                <View style={styles.item}>
                    <Text  style = {styles.header}>Lộ trình lượt đi: 
                        <Text style={styles.content}>
                            {'  ' + data.InBoundDescription.slice(0, data.InBoundDescription.length-2)}
                        </Text>
                    </Text > 
                </View>    

                <View style = {styles.item}>
                    <Text  style = {styles.header} >Lộ trình lượt về: 
                        <Text style={styles.content}>
                            {'   ' + data.OutBoundDescription.slice(0, data.OutBoundDescription.length-1)}
                        </Text>
                    </Text>
                </View>  

            </ScrollView>
        }
    </View>
}

const getFareTickets = (myString: string) => {
    const myArrString = myString.split('<br/>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp- ');
    if (myArrString.length == 4) {
        return [myArrString[1].slice(17), myArrString[2].slice(22),  myArrString[3].slice(8)]
    }
    if (myArrString.length == 5) {
        return [myArrString[1].slice(17), myArrString[2].slice(22),  myArrString[4].slice(8)]
    }
    return []
}

const styles = StyleSheet.create({
    container: {
        margin: 30,
        marginTop: 50,
        // paddingBottom: 30,
        marginBottom: 30,
    },
    header: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
        marginRight: 10
    },
    content: {
        fontSize: 14,
        fontWeight: '400',
        marginBottom: 4,
    },
    item: {
        flexDirection: 'row',
    }
})

function dispatch(arg0: any) {
    throw new Error('Function not implemented.')
}