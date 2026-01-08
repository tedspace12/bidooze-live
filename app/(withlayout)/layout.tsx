'use client'
import { AppSidebar } from "@/components/app-sidebar"
import HeaderBreadcrumbs from "@/components/header-breadcrumbs"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from '@/lib/utils'
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

export default function BidoozeSellerLayout({ children }: { children: React.ReactNode }) {

    return (
        <ProtectedRoute allowedRoles={["auctioneer", "admin", "superadmin"]}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <HeaderBreadcrumbs />
                    <div className="min-h-screen bg-background">
                        <main className={cn(
                            "transition-all duration-300"
                        )}>
                            <div className='pt-0 p-6'>{children}</div>
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    )
}
