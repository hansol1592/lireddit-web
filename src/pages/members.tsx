import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Layout } from "../components/Layout";
import { useCreatePostMutation, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useIsAuth } from "../utils/useIsAuth";
import { withApollo } from "../utils/withApollo";
import { makeVar, useQuery } from "@apollo/client";
import { inputFields, INPUT_VALUES } from "../graphql/localstate/inputValues";
import { datalistVar, DATA_LIST } from "../graphql/localstate/dataList";

function CreatePost() {
  const router = useRouter();
  useIsAuth();
  const { loading, error, data } = usePostsQuery({
    variables: {
      limit: 10,
      cursor: null,
    },
  });
  const [createPost] = useCreatePostMutation();

  const {
    data: inputData,
    loading: inputLoading,
    error: inputError,
  } = useQuery(INPUT_VALUES);
  const {
    data: datalistData,
    loading: datalistLoading,
    error: datalistError,
  } = useQuery(DATA_LIST);
  console.log("datalistData: ", datalistData?.datalist);

  console.log("locastate useQuery: ", inputData);

  console.log("localstate: ", inputFields());

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    inputFields({
      ...inputFields(),
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    const { errors } = await createPost({
      variables: { input: inputFields() },
    });
    datalistVar([...datalistVar(), inputFields()]);
  }

  return (
    <div>
      <div>members</div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div>data</div>
          {!datalistLoading &&
            !datalistError &&
            datalistData.datalist.map((item: any, index: any) => (
              <div key={index}>
                <div>{item.title}</div>
                <div>{item.text}</div>
              </div>
            ))}
        </div>
        <div>
          <div>input</div>
          <input
            type="text"
            name="title"
            onChange={handleChange}
            style={{
              border: "2px solid black",
              width: "100px",
              height: "30px",
            }}
          />
          <input
            type="text"
            name="text"
            onChange={handleChange}
            style={{
              border: "2px solid black",
              width: "100px",
              height: "30px",
            }}
          />
          <button style={{ border: "2px solid black" }} onClick={handleSubmit}>
            submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default withApollo({ ssr: false })(CreatePost);
