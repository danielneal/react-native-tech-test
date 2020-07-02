import React from 'react';
import { NavigationContainer  } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import SearchScreen from "./screens/SearchScreen"
import RecipeScreen from "./screens/RecipeScreen"
import {
    RecoilRoot,
} from 'recoil';

const Stack = createStackNavigator();

export default function App() {
    return (
            <RecoilRoot>
              <NavigationContainer>
                <Stack.Navigator>
                  <Stack.Screen name="Search" component={SearchScreen} />
                  <Stack.Screen name="Recipe" component={RecipeScreen} />
                </Stack.Navigator>
              </NavigationContainer>
            </RecoilRoot>
    );
}
