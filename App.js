import { StatusBar } from 'expo-status-bar';
import React, { Suspense } from 'react';
import { StyleSheet, TextInput, Text, View, SafeAreaView, ActivityIndicator } from 'react-native';
import * as style from "./style"
import { request } from 'graphql-request'

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
    query recipe_search($q: String!) {
       recipe_search(q:$q) {
         total_hits
       }
    }
  `

function Input() {
    const [text, setText] = useRecoilState(textState);

    const onChange = (text) => {
        console.log(text);
        setText(text);
    };

    return (
            <View>
            <TextInput type="text" onChangeText={onChange} />
            <Text>Echo: {text}</Text>
        </View>
    );
}

const charCountState = selector({
    key: 'charCountState',
    get: ({get}) => {
        const text = get(textState);
        return text.length;
    },
});

const numberOfHitsState = selector({
    key:`numberOfHitsState`,
    get: async ({get}) => {
        const text = get(textState)
        const result=await request(endpoint,query, {q:text})
        console.log(result)
        return result.recipe_search.total_hits
    }
})

function CharacterCount() {
    const count = useRecoilValue(charCountState);
    return <Text>Character Count: {count}</Text>;
}

function QueryResults() {
    const hits=useRecoilValue(numberOfHitsState)
    return <Text>QueryHits{hits}</Text>
}

function Search() {
    return (
            <SafeAreaView>
            <Input />
            <CharacterCount />
            <Suspense fallback={<ActivityIndicator/>}>
            <QueryResults/>
            </Suspense>
            </SafeAreaView>
    );
}
export default function App() {
    return (
            <RecoilRoot>
            <Search />
            </RecoilRoot>
    );
}
