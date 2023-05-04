import React from "react";
import {StyleSheet, View, Text} from "react-native"
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeContainer } from "@/Screens/Home";
import NotificationContainer from "@/Screens/Notification/NotifcationContainer";
import FavouriteContainer from "@/Screens/Favourite/FavouriteContainer";
import { Icon } from "@/Theme/Icon/Icon";
import { Colors, FontSize } from "@/Theme/Variables";

const Tab = createBottomTabNavigator();
// @refresh reset
export const MainNavigator = () => {
  return (
    <Tab.Navigator
        screenOptions={{
            tabBarActiveTintColor: Colors.SECONDARY60,
            tabBarInactiveTintColor: 'black',
            tabBarActiveBackgroundColor: Colors.SECONDARY20,
            tabBarStyle: { height: 60 },
            headerShown: false,
        }}
    initialRouteName="HomeContainer"
    >
      <Tab.Screen
        name="HomeContainer"
        component={HomeContainer}
        options={{
            tabBarIcon: ({ color, focused }) => (
                <View style={styles.tabbar}>
                    <Icon name='home' size={24} color={color}/>
                </View> 
            ),
            tabBarLabel: ({ color, focused }) => (
                <Text style={[styles.label, {color: color}]} >Trang chủ</Text>
            ),
        }}
      />
      <Tab.Screen
        name="Payment"
        component={HomeContainer}
        options={{
            tabBarIcon: ({ color, focused }) => (
                <View style={styles.tabbar}>
                    <Icon name='money' size={24} color={color}/>
                </View> 
            ),
            tabBarLabel: ({ color, focused }) => (
                <Text style={[styles.label, {color: color}]} >Thanh toán</Text>
            ),
        }}
      />

      <Tab.Screen
        name="Notification"
        component={NotificationContainer}
        options={{
            tabBarIcon: ({ color, focused }) => (
                <View style={styles.tabbar}>
                    <Icon name='notification' size={22} color={color}/>
                </View> 
            ),
            tabBarLabel: ({ color, focused }) => (
                <Text style={[styles.label, {color: color}]} >Thông báo</Text>
            ),
        }}
      />

      <Tab.Screen
        name="Favourite"
        component={FavouriteContainer}
        options={{
            tabBarIcon: ({ color, focused }) => (
                <View style={styles.tabbar}>
                    <Icon name='collection' size={24} color={color}/>
                </View> 
            ),
            tabBarLabel: ({ color, focused }) => (
                <Text style={[styles.label, {color: color}]} >Yêu thích</Text>
            ),
        }}
      />
      <Tab.Screen
        name="More"
        component={HomeContainer}
        options={{
            tabBarIcon: ({ color, focused }) => (
                <View style={styles.tabbar}>
                    <Icon name='more' size={24} color={color}/>
                </View> 
            ),
            tabBarLabel: ({ color, focused }) => (
                <Text style={[styles.label, {color: color}]} >Thông tin</Text>
            ),
        }}
      />
    </Tab.Navigator>

    
  );
};


const styles = StyleSheet.create({
  tabbar: {
    flexDirection: 'column',
        alignItems: 'center',
    marginBottom: -10
  },
  label: {
    fontSize: 10,
    fontWeight: '400',
    marginBottom: 10
  }
})