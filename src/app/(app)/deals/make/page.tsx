"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { debounce } from "lodash";
import { 
  FileSignature, 
  ShieldCheck, 
  Clock, 
  Banknote, 
  Info, 
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/hooks/useSocket"; 
import { toast } from "sonner";

const dealSchema = z.object({
  title: z.string().min(5, "Title is too short"),
  amount: z.string().regex(/^\d+$/, "Must be a valid number"),
  deadline: z.string().min(1, "Deadline is required"),
  terms: z.string().min(20, "Please provide more detailed terms"),
});

type DealFormData = z.infer<typeof dealSchema>;

export default function MakeDealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const socket = useSocket();

  const roomId = searchParams.get("roomId");
  const recipientId = searchParams.get("recipientId");
  const isBuyer = searchParams.get("isBuyer") === "true";

  const [otherPartyAgreed, setOtherPartyAgreed] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: { title: "", amount: "", deadline: "", terms: "" }
  });

  // 1. Real-time Socket Synchronization
  useEffect(() => {
    // Null check for socket and essential params
    if (!socket || !roomId) return;

    socket.emit("join_draft_room", { roomId, userId: user?.id });

    socket.on("draft_sync", (data: Partial<DealFormData>) => {
      Object.entries(data).forEach(([key, val]) => {
        if (val) setValue(key as keyof DealFormData, val as string);
      });
    });

    socket.on("draft_updated", (data: Partial<DealFormData>) => {
      Object.entries(data).forEach(([key, val]) => {
        if (val) setValue(key as keyof DealFormData, val as string);
      });
    });

    socket.on("user_agreed", ({ sdNumber }: { sdNumber: string }) => {
      if (sdNumber !== user?.sdNumber) {
        setOtherPartyAgreed(true);
        toast.info("The other party has signed the proposal!");
      }
    });

    socket.on("deal_finalized", ({ dealId }: { dealId: string }) => {
      toast.success("Deal Finalized!");
      router.push(`/deals/${dealId}`);
    });

    return () => {
      socket.off("draft_sync");
      socket.off("draft_updated");
      socket.off("user_agreed");
      socket.off("deal_finalized");
    };
  }, [socket, roomId, user, setValue, router]);

  // 2. Debounce Logic
  const debouncedEmit = useMemo(
    () =>
      debounce((data: Partial<DealFormData>) => {
        // Guard inside the debounce
        if (!socket || !roomId) return;

        socket.emit("update_draft", {
          roomId,
          data: {
            ...data,
            buyerId: isBuyer ? user?.id : recipientId,
            sellerId: isBuyer ? recipientId : user?.id,
          },
          senderSD: user?.sdNumber,
        });
      }, 500),
    [socket, roomId, user, recipientId, isBuyer]
  );

  const watchedFields = watch();
  
  useEffect(() => {
    if (watchedFields.title || watchedFields.amount) {
      debouncedEmit(watchedFields);
    }
    return () => debouncedEmit.cancel();
  }, [watchedFields, debouncedEmit]);

  const onSign = () => {
    if (!socket || !roomId) {
      toast.error("Connection not ready. Please wait.");
      return;
    }

    const pin = window.prompt("Enter your 4-digit Security PIN to sign:");
    if (!pin) return;

    socket.emit("send_agreement", {
      roomId,
      userId: user?.id,
      sdNumber: user?.sdNumber,
      pin,
    });
  };
  
  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-12">
      <div className="bg-white border-b border-gray-100 py-6 px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
              <FileSignature size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">SureDeal Collaborative Drafter</h1>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Real-time Escrow Sync Active</p>
            </div>
          </div>
          {otherPartyAgreed && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-100 text-xs font-black">
              <CheckCircle2 size={16} /> COUNTERPARTY SIGNED
            </div>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-8 mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <FormField label="Job/Product Title" error={errors.title?.message}>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <input {...field} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-amber-500" placeholder="e.g. Website Design" />
                )}
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Price (KES)" error={errors.amount?.message}>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Controller
                    control={control}
                    name="amount"
                    render={({ field }) => (
                      <input {...field} type="number" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-amber-500" placeholder="0" />
                    )}
                  />
                </div>
              </FormField>
              <FormField label="Deadline" error={errors.deadline?.message}>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Controller
                    control={control}
                    name="deadline"
                    render={({ field }) => (
                      <input {...field} className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-amber-500" placeholder="10 Days" />
                    )}
                  />
                </div>
              </FormField>
            </div>

            <FormField label="Terms & Conditions" error={errors.terms?.message}>
              <Controller
                control={control}
                name="terms"
                render={({ field }) => (
                  <textarea {...field} rows={6} className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-medium text-sm" placeholder="Deliverables..." />
                )}
              />
            </FormField>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-[#1A1A1A] text-white p-10 rounded-[40px] shadow-2xl space-y-8">
            <div className="flex justify-between items-start">
              <ShieldCheck size={40} className="text-amber-500" />
              <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase">Draft</p>
                <p className="text-xs font-bold text-amber-500">#{roomId?.slice(-6).toUpperCase()}</p>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black">{watchedFields.title || "New Proposal"}</h3>
              <p className="text-amber-500 text-xl font-black">KES {Number(watchedFields.amount || 0).toLocaleString()}</p>
            </div>
            <button
              onClick={handleSubmit(onSign)}
              className="w-full bg-amber-500 text-black py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-transform active:scale-95"
            >
              <Lock size={20} /> SIGN CONTRACT
            </button>
          </div>
          <div className="mt-6 flex justify-center gap-8 opacity-50">
             <span className="text-[10px] font-black uppercase">You: Ready</span>
             <ArrowRight size={14} />
             <span className="text-[10px] font-black uppercase">Partner: {otherPartyAgreed ? 'Signed' : 'Drafting'}</span>
          </div>
        </div>
      </main>
    </div>
  );
}

// Fixed prop types to avoid 'any'
interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

function FormField({ label, children, error }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</label>
      {children}
      {error && <p className="text-red-500 text-[10px] font-bold uppercase">{error}</p>}
    </div>
  );
}