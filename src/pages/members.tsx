import NavBar from "../components/NavBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import {
  usePostsQuery,
  PostsQuery,
  useCreatePostMutation,
  PostsDocument,
  useUserListQuery,
  useRegisterMutation,
} from "../generated/graphql";
import { Layout } from "../components/Layout";
import { Link, Stack, Box, Heading, Text, Flex, Button } from "@chakra-ui/core";
import NextLink from "next/link";
import { useState, ChangeEvent } from "react";
import { withApollo } from "../utils/withApollo";
import { Formik, Form } from "formik";
import createPost from "./create-post";
import { InputField } from "../components/InputField";
import { useRouter } from "next/router";
import { gql } from "@apollo/client";

type IValues = {
  title: string;
  text: string;
};

const Members = () => {
  const router = useRouter();
  // const { data, error, loading, variables, refetch } = usePostsQuery({
  //   variables: {
  //     limit: 10,
  //     cursor: null,
  //   },
  //   notifyOnNetworkStatusChange: true,
  // });
  const { data, error, loading } = useUserListQuery();
  const [createPost] = useCreatePostMutation();
  const [register] = useRegisterMutation();
  if (!loading && !data) {
    return <div>you got query failed for some reason</div>;
  }

  const [values, setValues] = useState<IValues>({
    title: "",
    text: "",
  });
  const [registerValues, setRegisterValues] = useState({
    username: "",
    email: "",
    password: "",
  });

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setRegisterValues({
      ...registerValues,
      [e.target.name]: e.target.value,
    });
  }

  async function handleCreatePost() {
    // const { errors } = await createPost({
    //   variables: { input: values },
    //   update: (cache) => {
    //     cache.evict({ fieldName: "posts:{}" });
    //   },
    // });
    // if (!errors) {
    //   alert("errors");
    // }
    // setValues({
    //   title: "",
    //   text: "",
    // });
    const { errors } = await register({
      variables: { options: registerValues },
      update: (cache) => {
        cache.evict({ fieldName: "userlist:{}" });
      },
    });
    setRegisterValues({
      username: "",
      email: "",
      password: "",
    });
  }

  return (
    <div>
      <div>멤버 및 권한 관리</div>
      <div>
        <div>전체</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          {data &&
            data.userlist &&
            data?.userlist.map((p, index) => (
              <div
                key={p.email}
                style={{
                  border: "2px solid black",
                  width: "600px",
                  margin: "20px",
                }}
              >
                <div>title</div>
                <div>{p.username}</div>
                <div>text</div>
                <div>{p.email}</div>
              </div>
            ))}
        </div>
        <div
          style={{ border: "2px solid black", height: "300px", width: "300px" }}
        >
          <input
            type="text"
            name="username"
            placeholder="username"
            style={{ border: "2px solid black" }}
            onChange={handleChange}
          />
          <input
            type="text"
            name="email"
            placeholder="email"
            style={{ border: "2px solid black" }}
            onChange={handleChange}
          />
          <input
            type="text"
            name="password"
            placeholder="password"
            style={{ border: "2px solid black" }}
            onChange={handleChange}
          />
          <button onClick={handleCreatePost}>submit</button>
        </div>
      </div>
    </div>
  );
};

export default withApollo({ ssr: true })(Members);
