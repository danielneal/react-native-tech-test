import { StatusBar } from 'expo-status-bar';
import React, { Suspense } from 'react';
import { StyleSheet,
         TextInput,
         Text,
         View,
         SafeAreaView,
         ActivityIndicator,
         ScrollView,
         TouchableOpacity,
         Image} from 'react-native';
import * as style from "./style"
import { request } from 'graphql-request'
import { NavigationContainer , useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useWindowDimensions } from 'react-native';

import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
    selectorFamily
} from 'recoil';

const textState = atom({
    key: 'textState', // unique ID (with respect to other atoms/selectors)
    default: '', // default value (aka initial value)
});

const endpoint = "https://next.riverford.co.uk/graphql"

const searchQuery = /* GraphQL */ `
    query recipe_search($q: String!,$page_size: Int) {
       recipe_search(q:$q,page_size:$page_size) {
         total_hits
         hits {
            recipe {
               id
               slug
               name
               media {
                  height
                  width
                  uri
               }
            }

         }
}
       }
    }
  `

const recipeQuery = /* GraphQL*/ `
query recipe($slug: String!) {
       recipe(slug:$slug) {
           id
           introduction
           name
           media {
              height
              width
              uri
           }
         }
       }
`

function RecipeHit({recipe}) {
    const navigation=useNavigation()
    const image=recipe.media.find((img)=>img.height<150 &&img.height > 50)
    if(!image) {
        return <View/>
    }
    else {
        return <TouchableOpacity key={recipe.slug}
                  style={{padding:style.s3,flexDirection:"row"}}
                  onPress={()=>navigation.navigate('Recipe',{slug:recipe.slug})}>
            <Image source={{uri:image.uri}} style={{width:style.s7,height:style.s7,marginRight:style.s3}}/>
            <Text style={{fontSize:style.f3}}>{recipe.name}</Text>
            </TouchableOpacity>
    }
}

function Input() {
    const [text, setText] = useRecoilState(textState);
    const onChange = (text) => {
        setText(text);
    };

    return (
            <View style={{paddingVertical:style.s3}}>
            <TextInput style={{padding:style.s3,fontSize:style.f3}} placeholder="Search for Recipes" type="text" onChangeText={onChange} />
        </View>
    );
}

const hitsState = selector({
    key:`hitsState`,
    get: async ({get}) => {
        const text = get(textState)
        const result=await request(endpoint,searchQuery, {q:text,page_size:10})
        return result.recipe_search.hits
    }
})

const recipeState = selectorFamily({
    key: 'recipeState',
    get: (slug) => async ({get}) => {
        const result=await request(endpoint,recipeQuery,{slug:slug});
        return result;
    },

});

function QueryResults() {
    const hits=useRecoilValue(hitsState)
    return <ScrollView>
        {hits.map((hit)=><RecipeHit recipe={hit.recipe}/>)}
    </ScrollView>
}

function Recipe({slug}) {
    const result=useRecoilValue(recipeState(slug))
    const dimensions=useWindowDimensions()
    const image=result.recipe.media.find((img)=>img.height<800 && img.height > 400)
    return <ScrollView>
        <Text style={{fontSize:style.f3}}>{result.recipe.name}</Text>
        <Image source={{uri:image.uri}} style={{width:dimensions.width,height:dimensions.width}}/>
        <Text>{result.recipe.introduction}</Text>
        </ScrollView>
}

function RecipeScreen({route}) {
    return  <Suspense fallback={<ActivityIndicator/>}>
        <Recipe slug={route.params.slug}></Recipe>
        </Suspense>
}

function SearchScreen() {
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
            <Stack.Screen name="Search" component={SearchScreen} />
            <Stack.Screen name="Recipe" component={RecipeScreen} />
            </Stack.Navigator>
            </NavigationContainer>
            </RecoilRoot>
    );
}
