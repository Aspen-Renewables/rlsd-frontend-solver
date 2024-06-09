"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ReturnTypeOfGetApprovedQuoteGroups } from "@/db/queries";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";

type TotalApproved =
  | {
      id: number;
      amount: string;
    }
  | undefined;
const View = () => {
  const fetchData = async () => {
    const signal = new AbortController().signal;
    const res = await fetch("/api/get-approved-quote-groups", {
      cache: "no-cache",
      signal,
    });
    const _json = await res.json();
    let { totalApproved, approvedQuoteGroups } = _json as {
      totalApproved: TotalApproved;
      approvedQuoteGroups: ReturnTypeOfGetApprovedQuoteGroups;
    };

    return {
      totalApproved: parseFloat(totalApproved?.amount!) || 0,
      approvedQuoteGroups,
    };
  };
  const [approvedQuotesQuery] = useQueries({
    queries: [
      {
        queryKey: ["approvedQuotes"],
        queryFn: fetchData,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
      },
    ],
  });

  return (
    <div className="p-4">
      <div className="font-bold text-lg mt-12">
        <h1>
          Total Approved Budget: $
          {approvedQuotesQuery?.data?.totalApproved.toLocaleString()}
        </h1>
      </div>
      <div className="flex">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote Group Id</TableHead>
              <TableHead>Farm Value</TableHead>
              <TableHead>Protocol Fee</TableHead>
              <TableHead>Install Fee</TableHead>
              <TableHead>Budget Consumed</TableHead>
              <TableHead>Scouting Fee</TableHead>
              <TableHead>Installer Value</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {approvedQuotesQuery.data?.approvedQuoteGroups.map((quoteGroup) => {
              return (
                <TableRow>
                  <TableCell>{quoteGroup.quoteGroupId}</TableCell>
                  <TableCell>
                    $
                    {parseFloat(
                      quoteGroup.quoteGroup.quotes[0].quote!
                    ).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    ${Number(quoteGroup.quoteGroup.protocolFees).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    ${quoteGroup.quoteGroup.installFixedFee.toLocaleString()}
                  </TableCell>

                  <TableCell>
                    $
                    {(
                      parseFloat(quoteGroup.quoteGroup.quotes[0].quote!) +
                      parseFloat(quoteGroup.quoteGroup.protocolFees) +
                      parseFloat(quoteGroup.quoteGroup.installFixedFee)
                    ).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    $
                    {(
                      parseFloat(quoteGroup.quoteGroup.quotes[0].quote!) *
                      parseFloat(quoteGroup.quoteGroup.scoutingFee)
                    ).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    $
                    {(
                      parseFloat(quoteGroup.quoteGroup.quotes[0].quote!) *
                      (1 - parseFloat(quoteGroup.quoteGroup.scoutingFee))
                    ).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    <Link href={`/?groupId=${quoteGroup.quoteGroupId}`}>
                      <Button>View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default View;
