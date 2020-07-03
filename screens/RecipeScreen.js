import { useWindowDimensions } from 'react-native';
import { Text,
    View,
    ActivityIndicator,
    ScrollView,
    Image} from 'react-native';
import * as style from "../style"
import React, { Suspense } from 'react';
import { recipeState, screenOrientationState } from "../state"
import { useRecoilValue } from "recoil"
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import formatDuration from 'date-fns/formatDuration'
import parseISO from 'date-fns/parseISO'
import useDeviceOrientation from '@rnhooks/device-orientation';

function RecipeIngredients({recipe}) {
    return recipe.ingredients.map((entry,key)=> {
        return <View style={{padding:style.s3}} key={key}>
            <Text style={{fontSize:style.f3}}>{entry.component=="main"?"Ingredients":entry.component}</Text>
            {entry.ingredients.map((ingredient)=> {return <Text style={{fontSize:style.f2}}>{ingredient}</Text>})}
        </View>
    })
}

function RecipeMethod({recipe}) {
    return recipe.method.map((entry,key)=> {
        return <View style={{padding:style.s3}} key={key}>
            <Text style={{fontSize:style.f3}}>{entry.component=="main"?"Method":entry.component}</Text>
            {entry.steps.map((step)=> {return <Text style={{fontSize:style.f2,paddingVertical:style.s3}}>{step}</Text>})}
        </View>
    })
}

function RecipeIntroduction({recipe}) {
    return <>
      <Text style={{padding:style.s3,fontSize:style.f3}}>Introduction</Text>
      <Text style={{padding:style.s3,fontSize:style.f2}}>{recipe.introduction}</Text>
    </>
}

function formatISODuration(isoDuration) {
    let matches = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
    if(matches==undefined) {return undefined}
    let obj = {
        hours: matches[1],
        minutes: matches[2]
    };
    let text=obj.hours?obj.hours+"h":""+obj.minutes?obj.minutes+"m":"";
    return text
}

function RecipeServes ({recipe}) {
    return <View style={{flexDirection:"row",justifyContent:"flex-end",alignItems:"center",padding:style.s3}}>
          <Ionicons name="md-people" size={32} style={{marginRight:style.s3}}/>
          <Text style={{fontSize:style.f2}}>Serves {recipe.serves}</Text>
        </View>
}

function RecipeTimes ({recipe}) {
    const prep_time=formatISODuration(recipe.prep_time)
    const cook_time=formatISODuration(recipe.cook_time)
    const total_time=formatISODuration(recipe.cook_time)

    return <View style={{flexDirection:"row",justifyContent:"flex-end",alignItems:"center",padding:style.s3}}>
        <MaterialCommunityIcons name="clock-outline" size={32} style={{marginRight:style.s3}}/>
        <Text style={{fontSize:style.f2}}>{prep_time && "Prep "+prep_time} {total_time && "Total " + total_time}</Text>
        </View>
}

function RecipeTitle({recipe}) {
   return <Text style={{textAlign:"center",fontWeight:"bold",fontSize:style.f3,padding:style.s4}}>{recipe.name}</Text>

}

function RecipeImagePortrait({recipe}) {
    const image=recipe.media.find((img)=>img.height<800 && img.height > 400)
    const dimensions=useWindowDimensions()
    return image && <Image source={{uri:image.uri}} style={{width:dimensions.width,height:dimensions.width}}/>
}

function RecipeImageLandscape({recipe}) {
    const image=recipe.media.find((img)=>img.height<800 && img.height > 400)
    const dimensions=useWindowDimensions()
    return image && <Image source={{uri:image.uri}} style={{padding:style.s4,width:dimensions.width/2,height:dimensions.width/2}}/>
}

function Recipe({slug}) {
    const recipe=useRecoilValue(recipeState(slug)).recipe
    const deviceOrientation = useDeviceOrientation();
    console.log(deviceOrientation)
    if(deviceOrientation==="portrait")
    {
        return <ScrollView>
            <RecipeTitle recipe={recipe}/>
            <RecipeImagePortrait recipe={recipe}/>
            <RecipeServes recipe={recipe}/>
            <RecipeTimes recipe={recipe}/>
            <RecipeIntroduction recipe={recipe}/>
            <RecipeIngredients recipe={recipe}/>
            <RecipeMethod recipe={recipe}/>
            </ScrollView>
    } else {
        return <ScrollView>
            <RecipeTitle recipe={recipe}/>

            <View style={{flexDirection:"row"}}>
            <View style={{flex:1,justifyContent:"flex-end"}}>
              <RecipeServes recipe={recipe}/>
              <RecipeTimes recipe={recipe}/>
            </View>
            <View style={{flex:1}}>
            <RecipeImageLandscape recipe={recipe}/>
            </View>
            </View>
            <RecipeIntroduction recipe={recipe}/>
            <RecipeIngredients recipe={recipe}/>
            <RecipeMethod recipe={recipe}/>
            </ScrollView>
    }
}

export default function RecipeScreen({route}) {
    return <Suspense fallback={<ActivityIndicator/>}>
             <Recipe slug={route.params.slug}></Recipe>
           </Suspense>
}
