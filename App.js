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
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
           ingredients {
              component
              ingredients
           }
           method {
              component
              steps
           }
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
    return <TouchableOpacity key={recipe.slug}
                  style={{padding:style.s3,flexDirection:"row"}}
                  onPress={()=>navigation.navigate('Recipe',{slug:recipe.slug})}>
            {image && <Image source={{uri:image.uri}} style={{width:style.s7,height:style.s7,marginRight:style.s3}}/>}
            <Text style={{fontSize:style.f3}}>{recipe.name}</Text>
            </TouchableOpacity>
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

function QueryEmptyState() {
      return  <View style={{padding:style.s5,flex:1,padding:style.s4,justifyContent:"center",alignItems:"center"}}>
                <MaterialCommunityIcons name="food-variant" size={128}/>
                <Text style={{fontSize:style.f3}} textAlign="center">We have over 1000 recipes available to search, go ahead and type in the top bar to discover them.</Text>
        </View>
}
function QueryResults() {
    const hits=useRecoilValue(hitsState)
    const text=useRecoilValue(textState)
    if(text==="") {
        return <QueryEmptyState/>
    }
    else {
    return <ScrollView>
        {hits.map((hit)=><RecipeHit recipe={hit.recipe}/>)}
        </ScrollView>
    }
}

function RecipeIngredients({recipe}) {
    return recipe.ingredients.map((entry)=> {
        return <View style={{padding:style.s3}}>
            <Text style={{fontSize:style.f3}}>{entry.component=="main"?"Ingredients":entry.component}</Text>
            {entry.ingredients.map((ingredient)=> {return <Text style={{fontSize:style.f2}}>{ingredient}</Text>})}
        </View>
    })
}

function RecipeMethod({recipe}) {
    return recipe.method.map((entry)=> {
        return <View style={{padding:style.s3}}>
            <Text style={{fontSize:style.f3}}>{entry.component=="main"?"Method":entry.component}</Text>
            {entry.steps.map((step)=> {return <Text style={{fontSize:style.f2}}>{step}</Text>})}
        </View>
    })
}

function RecipeIntroduction({recipe}) {
    return <>
    <Text style={{padding:style.s3,fontSize:style.f3}}>Introduction</Text>
    <Text style={{padding:style.s3,fontSize:style.f2}}>{recipe.introduction}</Text>
    </>
}
function Recipe({slug}) {
    const recipe=useRecoilValue(recipeState(slug)).recipe
    const dimensions=useWindowDimensions()
    const image=recipe.media.find((img)=>img.height<800 && img.height > 400)
    console.log(recipe.ingredients);
    return <ScrollView>
        <Text style={{fontSize:style.f3,padding:style.s3}}>{recipe.name}</Text>
        {image && <Image source={{uri:image.uri}} style={{width:dimensions.width,height:dimensions.width}}/>}
        <RecipeIntroduction recipe={recipe}/>
        <RecipeIngredients recipe={recipe}/>
        <RecipeMethod recipe={recipe}/>
        </ScrollView>
}

function RecipeScreen({route}) {
    return <Suspense fallback={<ActivityIndicator/>}>
             <Recipe slug={route.params.slug}></Recipe>
           </Suspense>
}

function SearchScreen() {
    return (
            <SafeAreaView style={{flex:1}}>
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
