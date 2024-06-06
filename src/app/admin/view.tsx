"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React from "react";
import { useQueries } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import {
  ReturnTypeOfApproveQuoteGroup,
  ReturnTypeOfGetQuoteGroup,
} from "@/db/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
const View = () => {
  const [groupId, setGroupId] = React.useState<number | null>(null);

  async function getQuoteGroupClientSide(id: number) {
    const get = await fetch(`/api/find-group-by-id?groupId=${id}`);
    const data = await get.json();
    return data as ReturnTypeOfGetQuoteGroup;
  }
  const [findGroupQuery] = useQueries({
    queries: [
      {
        queryKey: ["findGroup", groupId],
        queryFn: () => getQuoteGroupClientSide(groupId as number),
        enabled: false,
      },
    ],
  });

  const approveQuoteGroupMutationFN = async () => {
    if (!groupId) return;
    const get = await fetch(`/api/approve-quote-group?groupId=${groupId}`);
    const data = await get.json();
    return data as ReturnTypeOfApproveQuoteGroup;
  };
  const approveQuoteGroupMutation = useMutation({
    mutationFn: approveQuoteGroupMutationFN,
    mutationKey: ["approveQuoteGroup", groupId],
    onSuccess: () => {
      toast.success("Successfully approved quote group");
    },
    onError: (error) => {
      toast.error("Error approving quote group");
    },
  });
  return (
    <div className="mt-12 px-4">
      <h1 className="text-lg uppercase font-bold">Find Group By Id</h1>
      <div className="flex gap-x-4 items-center ">
        <p>Group Id:</p>
        <Input
          type="number"
          className="w-48"
          placeholder="Enter Group Id"
          onChange={(e) => setGroupId(parseInt(e.target.value) as number)}
        />
      </div>
      <Button
        className="mt-4"
        onClick={() => {
          findGroupQuery.refetch();
        }}
      >
        {findGroupQuery.isLoading
          ? "Loading..."
          : findGroupQuery.isError
            ? "Error"
            : findGroupQuery.isSuccess
              ? "Success"
              : "Search"}
      </Button>

      {findGroupQuery.data && (
        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Electricity Price</TableHead>
                <TableHead>Power Output</TableHead>
                <TableHead>Zip Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>{findGroupQuery.data?.electricityPrice}</TableCell>
                <TableCell>{findGroupQuery.data?.powerOutput}</TableCell>
                <TableCell>{findGroupQuery.data?.zipCode}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {findGroupQuery.data?.quotes.map((quote) => {
            return (
              <TableRow key={quote.id}>
                <TableCell>
                  {new Date(
                    parseInt(quote.timestampToBenchmark) * 1000
                  ).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  ${parseFloat(quote.quote!).toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Button
        onClick={() => {
          //if success already don't call again
          if (approveQuoteGroupMutation.isPending) return;
          if (approveQuoteGroupMutation.isSuccess) return;
          approveQuoteGroupMutation.mutate();
        }}
        className="mt-4"
      >
        {approveQuoteGroupMutation.isPending
          ? "Loading..."
          : approveQuoteGroupMutation.isError
            ? "Error"
            : approveQuoteGroupMutation.isSuccess
              ? "Success"
              : "Approve"}
      </Button>
    </div>
  );
};

export default View;
