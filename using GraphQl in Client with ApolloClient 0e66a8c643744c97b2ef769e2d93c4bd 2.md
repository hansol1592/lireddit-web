# using GraphQl in Client with ApolloClient

- React, GraphQl, ApolloClient + GraphQL Code Generator
- 사용 범위
    - query(Read)
    - mutation(Create, Update, Delete)
    - pagination, refetch 등의 추가 작업

- 사용 과정 요약 - 서버는 세팅되어 있다고 가정
    - 폴더에 대한 설명은 아래에서
    1. graphql > quries / mutation 내에 원하는 쿼리 작성
    2. code generate (yarn code gen)
    3. code generate 의 결과로 graphql.tsx 생성
    4. 컴포넌트에서 graphql.tsx 에 생성된 타입, 문서(Document), 커스텀 훅 사용

- 폴더 구조
    - react 관련 폴더는 기존 react 구조를 사용 가능
    - GraphQl
        - [폴더] graphql
            - [폴더] fragments
                - 자주 사용하는 쿼리들을 정리해 둘 수 있다.
                - type interface 와 비슷하다고 볼 수 있다.
                - 사용할 때는 따로 import 하지 않아도 알아서 읽는다. 그렇기 때문에 오히려 오타 없는지 잘 확인할 필요!

                ```graphql
                # fragment 정의
                # RegularUser.graphql

                fragment RegularUser on User {
                  id
                  username
                }

                # 사용
                # login.graphql

                mutation Login($usernameOrEmail: String!, $password: String!) {
                  login(usernameOrEmail: $usernameOrEmail, password: $password) {
                    ...RegularUserResponse
                  }
                }
                ```

            - [폴더] mutations
                - mutation 에 필요한 쿼리들을 정리
                - login.graphql

                ```graphql
                mutation Login($usernameOrEmail: String!, $password: String!) {
                  login(usernameOrEmail: $usernameOrEmail, password: $password) {
                    ...RegularUserResponse
                  }
                }
                ```

            - [폴더] queries
                - query 에 필요한 쿼리들을 정리
                - me.graphql

                ```graphql
                query Me {
                  me {
                    ...RegularUser
                  }
                }
                ```

                - posts.graphql

                ```graphql
                query Posts {
                  posts {
                    id
                    createdAt
                    updatedAt
                    title
                  }
                }
                ```

        - [폴더] generated
            - code generate 를 사용했을 때 결과로 떨어지는 파일들이 담길 폴더 (경로 설정)
            - yarn gen → "graphql-codegen --config codegen.yml" 실행 → generated 폴더 안에 graphql.tsx 파일에 generate 된 결과가 담겨 있음
            - graphql.tsx
                - 쿼리에 대한 타입
                - Document: 쿼리의 원본 형태
                - use[Name](Query/Mutation): graphql/mutations or quries 안에 정의해둔 쿼리를 사용할 수 있는 커스텀 훅스의 형태로 export 한다.
                컴포넌트에서 해당 훅스에서 필요한 값을 가져와서 사용하면 된다.

- GraphQL Code Generator
    - code generate 시 graphql.tsx 생성
    - 타입, 문서, 커스텀 훅을 제공
    - 커스텀 훅은 apollo 의 hooks 와 같은 문법을 따름

    ```jsx
    // Query
    const { data, error, loading, variables, refetch } = usePostsQuery({
        variables: {
          limit: 10,
          cursor: null,
        },
        notifyOnNetworkStatusChange: true,
      });

    // Mutation
    const [login] = useLoginMutation();
    ```

    - 사용 예

        ```jsx
        import React from "react";
        import { MeDocument, MeQuery, useLoginMutation } from "../generated/graphql";

        function Login() {
          const router = useRouter();

          // 커스텀 훅 사용: useLoginMutation
          const [login] = useLoginMutation();
          return (
            <Wrapper variant="small">
              <Formik
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                  const response = await login({
                    variables: values,
                    update: (cache, { data }) => {

                      // 쿼리 타입 사용: MeQuery
                      cache.writeQuery<MeQuery>({

                        // 쿼리 문서 사용: MeDocument
                        query: MeDocument,
                        data: {
                          __typename: "Query",
                          me: data?.login.user,
                        },
                      });
                      cache.evict({ fieldName: "posts:{}" });
                    },
                  });
                  if (response.data?.login.errors) {
                    console.error("error!", response.data?.login.errors);
                    setErrors(toErrorMap(response.data.login.errors));
                  } else if (response.data?.login.user) {
                    if (typeof router.query.next === "string") {
                      router.push(router.query.next);
                    } else {
                      router.push("/");
                    }
                  }
                }}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <Button
                      mt={4}
                      type="submit"
                      isLoading={isSubmitting}
                      variantColor="teal"
                    >
                      login
                    </Button>
                  </Form>
                )}
              </Formik>
            </Wrapper>
          );
        }

        export default withApollo({ ssr: false })(Login);
        ```

- ApolloClient 설정
- 대부분의 설정은 공식 문서를 따른다.
- ApolloClient 내에 존재하는 다양한 옵션 사용 가능
- 아래에서 cache 부분을 보면 typePolicies 설정을 했는데 해당 기능은  타입에 따른 동작을 지정할 수 있다. 예에서는 pagination 등에서 load more 했을 때 기존의 데이터와 새로 가져오는 데이터를 merge 하는 동작을 수행한다.
- 컴포넌트에서 함수로 실행되는 refetch 나, mutation 내의 update, 또는 ApolloClient 내에 지정하여 사용하는 캐쉬에 대한 동작들이 있어서 헷갈리는 데 사용방법을 정리하고 의도에 맞게 사용할 필요가 있겠다.

```jsx
import { createWithApollo } from "./createWithApollo";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { PaginatedPosts } from "../generated/graphql";
import { NextPageContext } from "next";

const createClient = (ctx: NextPageContext) =>
  new ApolloClient({
    uri: "http://localhost:4000/graphql",
    credentials: "include",
    headers: {
      cookie:
        (typeof window === "undefined" ? ctx.req?.headers.cookie : undefined) ||
        "",
    },
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: [],
              merge(
                existing: PaginatedPosts | undefined,
                incoming: PaginatedPosts
              ): PaginatedPosts {
                console.log(existing, incoming);

                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts],
                };
              },
            },
          },
        },
      },
    }),
  });

export const withApollo = createWithApollo(createClient);
```

- 캐쉬 업데이트를 하지 않아도 가끔 반영이 된 것 같을 때가 있는데, 예를들면 포스트를 생성하고, 리스트 페이지가 업데이트 된 경우다. 이것은 캐쉬가 존재하지 않는 상태에서 로딩 되며 캐쉬가 해당 시점에 반영됐기 때문인 듯 하다. 이 상태에서 다시 포스트를 생성하면 기존 캐쉬를 읽기 때문에 업데이트가 안되는 듯. 그렇기 때문에 캐쉬 업데이트를 설정해 줘야 한다.

- 이러면 기본 mutation, query 할 수 있고, cache update 가 가능한 세팅 완료!

- 이제 컴포넌트에서 쓰면 된다.

- pages
    - queries 또는 mutation 이 필요한 경우 generate 된 커스텀 훅을 가져와서 사용한다.

    ```jsx
    // Query
    const { data, error, loading, variables, refetch } = usePostsQuery({
        variables: {
          limit: 10,
          cursor: null,
        },
        notifyOnNetworkStatusChange: true,
      });

    // Mutation
    const [login] = useLoginMutation();
    const [logout, { loading: logoutFetching }] = useLogoutMutation();
    ```

    - Query 에서 제공하는 data, error, loading 을 통해 값을 핸들링 할 수 있으며 추가로 제공하는 메서드를 이용해서 refetch 등의 동작을 수행할 수 있다.
    - mutation 만 필요할 경우 첫번째 값은 사용하지 않고 두번째에서 mutation 만 꺼내서 사용한다.
    - Query 와 Mutation 둘 다 튜플로 제공되며, 안에 여러 메서드들을 제공하고 있으니 찾아보면서 사용해 볼 수 있겠다.

- Formik
    - Let's face it, forms are really verbose in React. To make matters worse, most form helpers do wayyyy too much magic and often have a significant performance cost associated with them. Formik is a small library that helps you with the 3 most annoying parts:
    1. Getting values in and out of form state
    2. Validation and error messages
    3. Handling form submission

    By colocating all of the above in one place, Formik will keep things organized--making testing, refactoring, and reasoning about your forms a breeze.

    - 구조를 보면 아래와 같이 body 부분을 감싸고 있고, initialValues 나 onSubmit 등을 설정해서 사용할 수 있다.

    ```jsx
    <Wrapper>
    	<Formik
    		initialValues={{ username: "", email: "", password: "" }}
    	  onSubmit={async (values, { setErrors }) => {
          const response = await register({ options: values });
          if (response.data?.register.errors) {
            console.error("error!", response.data?.register.errors);
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push("/");
          }
        }}
    	>

    		{* somethinig logic... *}

    	</Formik>
    </Wrapper>
    ```

    - 편한것 같기도 한데 아직은 낯설긴 하다.
    - 그렇긴 해도 위에서 언급했듯 loading 이나 error 에 대해 formik 에 맡기고 data 만 가져와서 사용할 수 있다는 장점이 있다.

- Cache 업데이트
- mutation 등의 동작에 따라 cache 의 데이터를 업데이트
- (예: 회원가입 또는 로그인 시 유저 상태 변경 ,포스트 생성 시 리스트에 반영)
- 회원가입 - update

```jsx
import React from "react";
import { Formik, Form } from "formik";
import { useRegisterMutation, MeQuery, MeDocument } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";

function Register() {
  const router = useRouter();
  const [register] = useRegisterMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
					
					// Mutation 사용
          const response = await register({
            variables: { options: values },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: "Query",
                  me: data?.register.user,
                },
              });
            },
          });
        }}
      >
      </Formik>
    </Wrapper>
  );
}

export default withApollo({ ssr: false })(Register);
```

- 페이지 네이션 - refetch

```jsx
import NavBar from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { usePostsQuery, PostsQuery } from "../generated/graphql";

const Index = () => {
  const { data, error, loading, variables, refetch } = usePostsQuery({
    variables: {
      limit: 10,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (!loading && !data) {
    return <div>you got query failed for some reason</div>;
  }

  return (
          <Button
            onClick={() => {
              refetch({
                limit: variables?.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={loading}
            m="auto"
            my={8}
          >
            load more
          </Button>
};

export default withApollo({ ssr: true })(Index);
```

- 포스트 생성 - update with fieldName
    - 여기서 Mutation 함수의 update 안에 설정한 fieldName 을 통해 ApolloClient 에 설정한 typePolicies 의 fields 를 읽는 듯 하다.

```jsx
import React from "react";
import { useCreatePostMutation } from "../generated/graphql";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";

function CreatePost() {
  const router = useRouter();
  useIsAuth();
  const [createPost] = useCreatePostMutation();

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: "", text: "" }}
        onSubmit={async (values, { setErrors }) => {
          const { errors } = await createPost({
            variables: { input: values },
            update: (cache) => {
              cache.evict({ fieldName: "posts:{}" });
            },
          });
          if (!errors) {
            router.push("/");
          }
        }}
      >
      </Formik>
    </Layout>
  );
}

export default withApollo({ ssr: false })(CreatePost);
```