import React from "react";
import View from "./view";
import { cookies } from "next/headers";
const Page = () => {
  console.log(cookies().get("x-password"));
  return (
    <>
      <View />
    </>
  );
};

export default Page;
