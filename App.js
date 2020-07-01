import { StatusBar } from 'expo-status-bar';
import React, { Suspense } from 'react';
import { StyleSheet, TextInput, Text, View, SafeAreaView, ActivityIndicator,ScrollView } from 'react-native';
import * as style from "./style"
import { request } from 'graphql-request'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from 'recoil';

const textState = atom({
    key: 'textState', // unique ID (with respect to other atoms/selectors)
    default: '', // default value (aka initial value)
});

const endpoint = "https://next.riverford.co.uk/graphql"

const query = /* GraphQL */ `
    query recipe_search($q: String!,$page_size: Int) {
       recipe_search(q:$q,page_size:$page_size) {
         total_hits
         hits {
            recipe {
               name
               media {
                  uri
               }
            }

         }
}
       }
    }
  `


function RecipeHit({recipe}) {
        return <View style={{padding:style.s3}}>
          <Text>{recipe.name }</Text>
        </View>
}

function Input() {
    const [text, setText] = useRecoilState(textState);
    const onChange = (text) => {
        setText(text);
    };

    return (
            <View>
            <TextInput style= {{padding:style.s3}} type="text" onChangeText={onChange} />
        </View>
    );
}

const hitsState = selector({
    key:`hitsState`,
    get: async ({get}) => {
        const text = get(textState)
        const result=await request(endpoint,query, {q:text,page_size:10})
        return result.recipe_search.hits
    }
})


function QueryResults() {
    const hits=useRecoilValue(hitsState)
    return <ScrollView>
        {hits.map((hit)=><RecipeHit recipe={hit.recipe}/>)}
    </ScrollView>
}

function Search() {
    return (
            <SafeAreaView>
            <Input />
            <Suspense fallback={<ActivityIndicator/>}>
            <QueryResults/>
            </Suspense>
            </SafeAreaView>
    );
}

const Stack = createStackNavigator();


export default function App() {
    return (
            <RecoilRoot>
            <NavigationContainer>
            <Stack.Navigator>
              <Stack.Screen name="Search" component={Search} />
            </Stack.Navigator>
            </NavigationContainer>
            </RecoilRoot>
    );
}
