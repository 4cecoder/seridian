"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@bytecats/ui-kit";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  clients: "Clients",
  issues: "Issues",
  contracts: "Contracts",
  proposals: "Proposals",
  bookings: "Bookings",
  sales: "Sales",
  templates: "Templates",
  files: "Files",
  chat: "Chat",
  sync: "Sync",
  casestudies: "Case Studies",
  packages: "Packages",
};

function formatSegment(segment: string): string {
  if (routeLabels[segment]) return routeLabels[segment];
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface BreadcrumbsProps {
  className?: string;
  maxItems?: number;
}

export function Breadcrumbs({ className, maxItems = 4 }: BreadcrumbsProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  const items = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = formatSegment(segment);
    const isLast = index === segments.length - 1;
    return { href, label, isLast };
  });

  const shouldTruncate = items.length > maxItems;
  const visibleItems = shouldTruncate
    ? [...items.slice(0, 1), { href: "", label: "...", isEllipsis: true }, ...items.slice(-(maxItems - 2))]
    : items;

  return (
    <Breadcrumb aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <BreadcrumbList className="gap-1 text-xs sm:gap-1.5">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link
              href="/dashboard"
              className="text-slate-500 transition-colors hover:text-slate-300"
            >
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {visibleItems.map((item, index) => {
          if ("isEllipsis" in item && item.isEllipsis) {
            return (
              <BreadcrumbItem key="ellipsis">
                <BreadcrumbEllipsis className="text-slate-600" />
              </BreadcrumbItem>
            );
          }

          const breadcrumbItem = item as {
            href: string;
            label: string;
            isLast: boolean;
          };

          return (
            <BreadcrumbItem key={breadcrumbItem.href + index}>
              <BreadcrumbSeparator className="text-slate-700">
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 4.5l7.5 7.5-7.5 7.5"
                  />
                </svg>
              </BreadcrumbSeparator>
              {breadcrumbItem.isLast ? (
                <BreadcrumbPage className="font-medium text-slate-300">
                  {breadcrumbItem.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link
                    href={breadcrumbItem.href}
                    className="text-slate-500 transition-colors hover:text-slate-300"
                  >
                    {breadcrumbItem.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
