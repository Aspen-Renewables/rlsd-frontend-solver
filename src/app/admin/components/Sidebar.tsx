"use client";
import clsx from "clsx";
import { DashboardItem } from "../layout";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export const Sidebar = ({ sections }: { sections: DashboardItem[] }) => {
  const pathname = usePathname();
  return (
    <div>
      {sections.map((item) => {
        return (
          <div
            key={item.title}
            className={clsx(
              "p-4 border",

              //If the href is the current page, add a different background color
              pathname === item.href && "bg-gray-300"
            )}
          >
            <a href={item.href} className="flex items-center space-x-2">
              {item.icon}
              <span className="text-xs uppercase font-bold">{item.title}</span>
            </a>
          </div>
        );
      })}
    </div>
  );
};
