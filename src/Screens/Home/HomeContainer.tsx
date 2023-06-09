import { Home } from "./Home";
import {FindRoute} from "./FindRoute";
import {HintRoutes} from "./HintRoutes";
import { Guide } from "./Guide";
import React, { useState, useEffect } from "react";
import { useLazyGetUserQuery } from "@/Services";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAppDispatch, useAppSelector } from "@/Hooks/redux";
import { SETISUSED } from "@/Store/reducers";
import InfoBus from "./InfoBus";

export type HomeStackParamList = {
  ["Home"]: { data: any; isLoading: boolean },
  ['FindRoute']: {status: string, target?: any},
  ['HintRoutes']: {startData: any, targetData: any},
  ['Guide']: { data: any, startData: any, targetData: any },
  ['BusInfo'] : {data: string}
}

const HomeStack = createNativeStackNavigator<HomeStackParamList>()

export const HomeContainer = ():JSX.Element => {
  const dispatch = useAppDispatch()
  const [userId, setUserId] = useState("9");

  const {user, isUsedApp} = useAppSelector(state => state.user)

  const [fetchOne, { data, isSuccess, isLoading, isFetching, error }] =
    useLazyGetUserQuery();

  useEffect(() => {
    //fetchOne(userId);
    //console.log(user, isUsedApp)
    if (!isUsedApp) {
      dispatch(SETISUSED({}))
    }
  }, []);

  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen
        name="Home"
        component={Home}
        initialParams={{ data, isLoading }}
      />

      <HomeStack.Screen
        name="FindRoute"
        component={FindRoute}
        initialParams={{status: "findRoute"}}
      />

      <HomeStack.Screen
        name="HintRoutes"
        component={HintRoutes}
      />

      <HomeStack.Screen
        name="Guide"
        component={Guide}
      />
      
      <HomeStack.Screen
        name="BusInfo"
        component={InfoBus}
      />
      
    </HomeStack.Navigator>
  
  )



  // return <Home data={data} isLoading={isLoading} />;
};
