import React from "react";
import {
  getApprovedQuoteGroups,
  ReturnTypeOfGetApprovedQuoteGroups,
} from "@/db/queries";
import View from "./view";
import { db } from "@/db/db";
export const dynamic = "force-dynamic";
export const revalidate = 1;

const Page = async () => {
  // const { signal } = new AbortController();

  return <View />;
};

export default Page;
