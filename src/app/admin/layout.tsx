import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaAccusoft, FaAcquisitionsIncorporated } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { metadata } from "@/constants/metadata";
import clsx from "clsx";
import { Sidebar } from "./components/Sidebar";
export type DashboardItem = {
  title: string;
  icon: React.ReactNode;
  href: string;
};

const DASHBOARD_ITEMS = [
  {
    title: "Dashboard",
    icon: <FaAcquisitionsIncorporated />,
    href: "/admin/approved-quotes",
  },
  {
    title: "Approve",
    icon: <FaAccusoft />,
    href: "/admin",
  },
];
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <SidebarContainer>{children}</SidebarContainer>;
};

const SidebarContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <div className="absolute left-0 top-0 w-[140px] border h-full bg-gray-100">
        <img
          className="ml-4"
          src={metadata.logo}
          width={40}
          height={40}
          alt=""
        />
        <div className="mt-32">
          <Sidebar sections={DASHBOARD_ITEMS} />
        </div>
      </div>
      <div className="ml-[140px] w-full">
        <ScrollArea>{children}</ScrollArea>
      </div>
    </div>
  );
};

export default Layout;
