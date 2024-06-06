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

const View = ({
  data,
  totalApproved,
}: {
  data: ReturnTypeOfGetApprovedQuoteGroups;
  totalApproved: number;
}) => {
  return (
    <div className="p-4">
      <div className="font-bold text-lg mt-12">
        <h1>Total Approved: ${totalApproved.toLocaleString()}</h1>
      </div>
      <div className="flex">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quote Group Id</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>View</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((quoteGroup) => {
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
                    <a href={`/?groupId=${quoteGroup.quoteGroupId}`}>
                      <Button>View</Button>
                    </a>
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
