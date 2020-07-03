import {
    Text,
    SafeAreaView,
    View,
    ActivityIndicator,
    ScrollView,
    FlatList,
    Image,
    TextInput,
    TouchableOpacity} from 'react-native';
import React, { Suspense } from 'react';
import * as style from "../style"
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { deviceTypeState,textState,hitsState,totalHitsState,resultsPageState, pageSize } from "../state"
import { useRecoilState,useRecoilValue } from "recoil"
import * as Device from 'expo-device';

function RecipeHit({recipe}) {
    const navigation=useNavigation()
    const image=recipe.media.find((img)=>img.height<150 &&img.height > 50)
    return <TouchableOpacity key={recipe.slug}
    style={{padding:style.s3,flexDirection:"row",flex:1}}
    onPress={()=>navigation.navigate('Recipe',{slug:recipe.slug})}>
        {image? <Image source={{uri:image.uri}} style={{width:style.s7,height:style.s7,marginRight:style.s3}}/>:
        <View style={{width:style.s7,height:style.s7,backgroundColor:style.ui3,marginRight:style.s3}}/>}
        <Text style={{fontSize:style.f3,flexGrow:1,flexShrink:1}}>{recipe.name}</Text>
        </TouchableOpacity>
}

const pagerHeight=50

function ResultsPager() {
    const [page, setPage] = useRecoilState(resultsPageState)
    const totalHits = useRecoilValue(totalHitsState)
    return <View style={{flexGrow:1,height:pagerHeight,backgroundColor:style.ui4,position:"absolute",right:0,left:0,bottom:0,flexDirection:"row",alignItems:"center",justifyContent:"space-around"}}>
             <TouchableOpacity onPress={()=>setPage(page-1)} style={{flexDirection:"row",alignItems:"center"}}>
                 <Ionicons name="ios-arrow-back" size={32} style={{marginRight:style.s4}}/>
                 <Text style={{fontSize:style.f2}}>Prev</Text>
             </TouchableOpacity>
             <Text style={{fontSize:style.f2}}>Showing {(page-1)*pageSize+1} - {Math.min(totalHits,page*pageSize)} of {totalHits}</Text>
             <TouchableOpacity onPress={()=>setPage(page+1)} style={{flexDirection:"row",alignItems:"center"}}>
                <Text style={{marginRight:style.s4,fontSize:style.f2}}>Next</Text>
                <Ionicons name="ios-arrow-forward" size={32}/>
             </TouchableOpacity>
           </View>
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
    const deviceType=useRecoilValue(deviceTypeState)
    if(text==="") {
        return <QueryEmptyState/>
    }
    else {
    return <View style={{flexGrow:1}}>
            <FlatList style={{flexGrow:1,height:0,marginBottom:pagerHeight}}
               data={hits}
               keyExtractor={item => item.recipe.id}
               numColumns={deviceType===Device.DeviceType.PHONE?1:2}
               renderItem={({item})=><RecipeHit recipe={item.recipe}/>}/>
            <ResultsPager/>
           </View>
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
