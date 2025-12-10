 "use client";

 import { X } from "lucide-react";

 interface FirstVisitPopupProps {
   onClose?: () => void;
 }

 export function FirstVisitPopup({ onClose }: FirstVisitPopupProps) {
   const handleClose = () => {
     try {
       localStorage.setItem("kiito-first-visit-popup-seen", "true");
     } catch {
       // 無視
     }
     onClose?.();
   };

   return (
     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
       <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
         <button
           aria-label="閉じる"
           onClick={handleClose}
           className="absolute right-3 top-3 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
         >
           <X className="h-5 w-5" />
         </button>

         <div className="p-6 space-y-4">
           <div className="flex items-start gap-3">
             <div className="mt-1 h-10 w-10 flex items-center justify-center rounded-full bg-cyan-100 text-cyan-700 font-bold">
               !
             </div>
             <div className="space-y-2">
               <h2 className="text-lg font-semibold text-slate-900">初めての方へ</h2>
               <p className="text-sm text-slate-700 leading-relaxed">
                 オープニングやサークショップ参加者の方は
                 <strong className="mx-1 text-slate-900">KIITOホール</strong>
                 へお越しください。会場フロアは下のマップを参考にどうぞ。
               </p>
             </div>
           </div>

           <div className="overflow-hidden rounded-xl border border-slate-200">
             <img
               src="https://kiito.jp/wordpress/wp-content/uploads/2017/08/floor_1f-202204.svg"
               alt="KIITOホール フロアマップ"
               className="w-full"
             />
           </div>

           <div className="flex justify-end">
             <button
               onClick={handleClose}
               className="inline-flex items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
             >
               OK
             </button>
           </div>
         </div>
       </div>
     </div>
   );
 }


