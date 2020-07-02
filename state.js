import {
   atom,
   selector,
   selectorFamily
} from 'recoil';
import { request } from 'graphql-request'

const endpoint = "https://next.riverford.co.uk/graphql"

const searchQuery = /* GraphQL */ `
    query recipe_search($q: String!,$page_size: Int,$page:Int) {
       recipe_search(q:$q,page_size:$page_size,page:$page) {
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
           serves
           prep_time
           cook_time
           total_time
           name
           notes
           media {
              height
              width
              uri
           }
         }
       }
`
export const textState = atom({
    key: 'textState', // unique ID (with respect to other atoms/selectors)
    default: '', // default value (aka initial value)
});

export const resultsPageState = atom({
    key:`resultsPageState`,
    default:1
})

export const resultsState = selector({
    key:`resultsState`,
    get: async ({get}) => {
        const text = get(textState)
        const page = get(resultsPageState)
        const results=await request(endpoint,searchQuery, {q:text,page_size:10,page:page})
        return results
    }
})

export const hitsState = selector({
    key:`hitsState`,
    get: ({get}) => {
        const results = get(resultsState)
        return results.recipe_search.hits
    }
})

export const totalHitsState = selector({
    key:`totalHitsState`,
    get: ({get}) => {
        const results = get(resultsState)
        return results.recipe_search.total_hits
    }
})

export const recipeState = selectorFamily({
    key: 'recipeState',
    get: (slug) => async ({get}) => {
        const result=await request(endpoint,recipeQuery,{slug:slug});
        return result;
    },

});
