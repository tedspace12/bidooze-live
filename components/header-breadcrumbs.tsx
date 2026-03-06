"use client";

import { useNavigation } from "@/context/nav-context";
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export default function HeaderBreadcrumbs() {
    const { title } = useNavigation();

    return (
        <header className="flex min-h-14 shrink-0 items-center gap-2 px-3 sm:px-4 py-2">
            <SidebarTrigger />
            <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
            />

            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage className="text-sm sm:text-base truncate max-w-[70vw]">
                            {title || "Dashboard"}
                        </BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        </header>
    );
}
