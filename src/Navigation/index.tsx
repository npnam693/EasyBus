import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer, DefaultTheme} from "@react-navigation/native";
import { MainNavigator } from "./Main";
import { WelcomeContainer } from "./Welcome";
import { RootScreens } from "@/Screens";
import { Onboarding } from "@/Screens/Welcome/Onboarding";
import { AuthContainer } from "./Auth";
import { Colors } from "@/Theme/Variables";

export type RootStackParamList = {
  [RootScreens.MAIN]: undefined;
  [RootScreens.WELCOME]: undefined;
  [RootScreens.AUTH]: undefined;
};

const navTheme = DefaultTheme;
navTheme.colors.background = 'white';

const RootStack = createNativeStackNavigator<RootStackParamList>();

// @refresh reset
const ApplicationNavigator = () => {
  return (
    <NavigationContainer
      theme={navTheme}
    >

      <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={RootScreens.WELCOME}>
        <RootStack.Screen
          name={RootScreens.WELCOME}
          component={WelcomeContainer}
        />
        <RootStack.Screen
          name={RootScreens.AUTH}
          component={AuthContainer}
          options={{}}
        />
        <RootStack.Screen
          name={RootScreens.MAIN}
          component={MainNavigator}
          options={{}}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export { ApplicationNavigator };
