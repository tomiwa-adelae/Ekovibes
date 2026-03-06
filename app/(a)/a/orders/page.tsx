"use client";
import React, { useEffect, useState } from "react";
import {
  IconLoader2,
  IconReceipt,
  IconChevronLeft,
  IconChevronRight,
  IconSearch,
} from "@tabler/icons-react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminOrders, formatNaira, type AdminOrder } from "@/lib/events-api";
import { formatDate } from "@/lib/utils";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 20;

  const load = async (p: number) => {
    setLoading(true);
    try {
      const res = await getAdminOrders({ page: p, limit: LIMIT });
      setOrders(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ticket Orders"
        back
        description={`${total} paid order${total !== 1 ? "s" : ""}`}
      />

      <Card className="p-0">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
              <IconLoader2 size={32} className="animate-spin opacity-20" />
              <span className="text-xs uppercase tracking-widest">
                Loading orders…
              </span>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center text-muted-foreground">
              <IconReceipt size={40} stroke={1} />
              <p className="text-xs uppercase tracking-widest">
                No orders yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Reference</TableHead>
                  <TableHead>Buyer</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Tickets</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const ticketSummary = order.items
                    .map((item) => `${item.quantity}× ${item.ticketTier.name}`)
                    .join(", ");

                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {order.reference}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">
                            {order.user.firstName} {order.user.lastName}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {order.user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold line-clamp-1">
                            {order.event.title}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(order.event.date)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {ticketSummary}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-bold">
                          {formatNaira(order.total)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="uppercase tracking-widest">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-border hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <IconChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-border hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <IconChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
