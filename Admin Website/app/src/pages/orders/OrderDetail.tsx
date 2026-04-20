import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { mockOrders } from "@/stores/mockData";
import { ArrowLeft, FileText, DollarSign, RefreshCw, Ban, ArrowRightLeft } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const order = mockOrders.find((o) => o.id === id);

  if (!order) return <div className="flex h-96 items-center justify-center text-slate-500">Order not found</div>;

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate("/orders")} className="mb-4 flex items-center gap-1.5 text-xs text-slate-500 hover:text-hx-cyan">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Orders
      </button>

      <PageHeader title={order.orderNumber} subtitle={order.gig}>
        <div className="flex items-center gap-2">
          <StatusBadge label={order.status.replace("_", "-")} variant={order.status === "completed" ? "success" : order.status === "disputed" ? "error" : order.status === "in_progress" ? "info" : "warning"} />
        </div>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Order Timeline</h3>
            <div className="space-y-3">
              {order.timeline.map((evt, i) => (
                <div key={evt.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-hx-cyan/20">
                      <div className="h-2 w-2 rounded-full bg-hx-cyan" />
                    </div>
                    {i < order.timeline.length - 1 && <div className="h-full w-px bg-[#1E293B]" />}
                  </div>
                  <div className="pb-4">
                    <div className="text-xs font-medium text-slate-200">{evt.event}</div>
                    <div className="text-[11px] text-slate-500">{evt.actor} · {new Date(evt.timestamp).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {order.messages.length > 0 && (
            <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Messages</h3>
              {order.messages.map((msg) => (
                <div key={msg.id} className="mb-2 rounded-lg bg-hx-surface p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold ${msg.senderRole === "buyer" ? "text-hx-cyan" : "text-hx-purple"}`}>{msg.sender}</span>
                    <span className="text-[10px] text-slate-600">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-300">{msg.content}</p>
                </div>
              ))}
            </div>
          )}

          {order.files.length > 0 && (
            <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Delivered Files</h3>
              {order.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-lg bg-hx-surface p-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-xs text-slate-300">{file.name}</span>
                    <span className="text-[10px] text-slate-600">{file.size}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{file.uploadedBy}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Financial Breakdown</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs"><span className="text-slate-500">Order Amount</span><span className="font-mono text-slate-200">${order.amount}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Platform Fee</span><span className="font-mono text-slate-400">${order.fee}</span></div>
              <div className="flex justify-between text-xs"><span className="text-slate-500">Net to Seller</span><span className="font-mono text-emerald-400">${order.net}</span></div>
              <div className="my-2 h-px bg-[#1E293B]" />
              <div className="flex justify-between text-xs"><span className="text-slate-500">Escrow</span><StatusBadge label={order.escrowStatus} variant={order.escrowStatus === "held" ? "warning" : "success"} className="!text-[10px]" /></div>
            </div>
          </div>

          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Parties</h3>
            <div className="space-y-2">
              <div className="rounded-lg bg-hx-surface p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-hx-cyan">Buyer</div>
                <div className="mt-0.5 text-xs text-slate-200">{order.buyer}</div>
              </div>
              <div className="rounded-lg bg-hx-surface p-2.5">
                <div className="text-[10px] uppercase tracking-wider text-hx-purple">Seller</div>
                <div className="mt-0.5 text-xs text-slate-200">{order.seller}</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#1E293B] bg-[#111827] p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Admin Actions</h3>
            <div className="space-y-1.5">
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-hx-red">
                <DollarSign className="h-3.5 w-3.5" /> Manual Refund
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-emerald-400">
                <RefreshCw className="h-3.5 w-3.5" /> Force Complete
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-hx-orange">
                <Ban className="h-3.5 w-3.5" /> Force Cancel
              </button>
              <button className="flex w-full items-center gap-2 rounded-lg bg-hx-surface px-3 py-2 text-xs text-slate-300 hover:bg-hx-surface-hover hover:text-slate-200">
                <ArrowRightLeft className="h-3.5 w-3.5" /> Transfer Seller
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
