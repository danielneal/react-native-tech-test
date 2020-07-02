import { useWindowDimensions } from 'react-native';
import { Text,
    View,
    ActivityIndicator,
    ScrollView,
    Image} from 'react-native';
import * as style from "../style"
import React, { Suspense } from 'react';
import { recipeState } from "../state"
import { useRecoilValue } from "recoil"

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

export default function RecipeScreen({route}) {
    return <Suspense fallback={<ActivityIndicator/>}>
             <Recipe slug={route.params.slug}></Recipe>
           </Suspense>
}
