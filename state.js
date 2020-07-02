import {
   atom,
   selector,
   selectorFamily
} from 'recoil';
import { request } from 'graphql-request'

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
export const textState = atom({
    key: 'textState', // unique ID (with respect to other atoms/selectors)
    default: '', // default value (aka initial value)
});

export const hitsState = selector({
    key:`hitsState`,
    get: async ({get}) => {
        const text = get(textState)
        const result=await request(endpoint,searchQuery, {q:text,page_size:10})
        return result.recipe_search.hits
    }
})

export const recipeState = selectorFamily({
    key: 'recipeState',
    get: (slug) => async ({get}) => {
        const result=await request(endpoint,recipeQuery,{slug:slug});
        return result;
    },

});
