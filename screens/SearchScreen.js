import { 
    Text,
    SafeAreaView,
    View,
    ActivityIndicator,
    ScrollView,
    Image,
    TextInput, 
    TouchableOpacity} from 'react-native';
import React, { Suspense } from 'react';
import * as style from "../style"
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { textState,hitsState } from "../state"
import { useRecoilState,useRecoilValue } from "recoil"

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

export default function SearchScreen() {
    return (
            <SafeAreaView style={{flex:1}}>
            <Input />
            <Suspense fallback={<ActivityIndicator/>}>
            <QueryResults/>
            </Suspense>
        </SafeAreaView>
    );
}
