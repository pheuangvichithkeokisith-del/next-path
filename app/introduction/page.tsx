"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSession } from "@/api/session";
import ErrorBanner from "@/components/ErrorBanner";
import Loading from "@/components/Loading";
import { storeSessionId } from "@/hooks/useSession";
import { ArrowLeft, ArrowRight, Sparkles, AlertCircle } from "lucide-react";

export default function IntroductionPage() {
  const router = useRouter();
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hasError, setHasError] = useState(false);

  async function begin(): Promise<void> {
    setBusy(true);
    setHasError(false);
    try {
      const { session_id } = await createSession();
      storeSessionId(session_id);
      router.push("/assessment");
    } catch {
      setHasError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-2 text-sm text-[#2D4C3E]/70 hover:text-[#2D4C3E] mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>ກັບຄືນໜ້າຫຼັກ</span>
      </button>

      {/* Main Container Card */}
      <div className="bg-[#FFFFFF] border border-[#E5E1D8] rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 animate-fade-in-scale">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF2EE] text-[#2D4C3E] text-xs font-medium mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#8D5B28]" />
            <span>ຄຳແນະນຳກ່ອນເລີ່ມຕົ້ນ (Introduction)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D4C3E] tracking-tight">
            ຍິນດີຕ້ອນຮັບສູ່ເວັບໄຊສຳຫຼວດຕົນເອງ
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#2D4C3E]/80 leading-relaxed">
            ກ່ອນທີ່ເຈົ້າຈະເລີ່ມຕອບຄຳຖາມ, ພວກເຮົາຢາກໃຫ້ເຈົ້າຮູ້ສຶກສະບາຍໃຈ ແລະ ຜ່ອນຄາຍທີ່ສຸດ. ຂໍໃຫ້ອ່ານຂໍ້ແນະນຳສັ້ນໆ ນີ້:
          </p>
        </div>

        {/* 4 Points Guide */}
        <div className="space-y-4">
          <div className="flex gap-4 p-4 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8]/60">
            <div className="w-7 h-7 rounded-full bg-[#2D4C3E] text-[#F9F8F5] flex items-center justify-center shrink-0 text-sm font-semibold mt-0.5">
              1
            </div>
            <div>
              <h2 className="font-semibold text-sm sm:text-base text-[#2D4C3E]">
                ບໍ່ແມ່ນບົດສອບເສັງ ແລະ ບໍ່ມີຄຳຕອບຖືກ ຫຼື ຜິດ
              </h2>
              <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1 leading-relaxed">
                ທຸກຄຳຕອບສະທ້ອນເຖິງຄວາມຮູ້ສຶກ ແລະ ສິ່ງທີ່ເຈົ້າເປັນໃນຕອນນີ້. ບໍ່ມີຄຳຕອບໃດທີ່ດີກວ່າ ຫຼື ດ້ອຍກວ່າ. ເລືອກຂໍ້ທີ່ຕົງກັບໃຈເຈົ້າທີ່ສຸດ.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8]/60">
            <div className="w-7 h-7 rounded-full bg-[#8D5B28] text-[#F9F8F5] flex items-center justify-center shrink-0 text-sm font-semibold mt-0.5">
              2
            </div>
            <div>
              <h2 className="font-semibold text-sm sm:text-base text-[#2D4C3E]">
                ບໍ່ມີການເກັບຊື່, ອີເມວ ຫຼື ຂໍ້ມູນລະບຸຕົວຕົນ
              </h2>
              <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1 leading-relaxed">
                ພວກເຮົາບໍ່ຂໍຊື່ແທ້, ບໍ່ຂໍເບີໂທລະສັບ ແລະ ບໍ່ຂໍອີເມວ. ຂໍ້ມູນທັງໝົດຈະຖືກປະມວນຜົນສະເພາະສຳລັບການສຳຫຼວດນີ້ເທົ່ານັ້ນ.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8]/60">
            <div className="w-7 h-7 rounded-full bg-[#7A3E2D] text-[#F9F8F5] flex items-center justify-center shrink-0 text-sm font-semibold mt-0.5">
              3
            </div>
            <div>
              <h2 className="font-semibold text-sm sm:text-base text-[#2D4C3E]">
                ຄຳຕອບຈະຖືກໃຊ້ເພື່ອສ້າງ “ພາບລວມຄວາມສາມາດ ແລະ ທິດທາງ” ເທົ່ານັ້ນ
              </h2>
              <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1 leading-relaxed">
                ລະບົບຈະສະຫຼຸບຮູບແບບຄວາມສົນໃຈ ແລະ ຄວາມສາມາດ, ພ້ອມແນະນຳທິດທາງທີ່ໜ້າລອງ ແລະ ການທົດລອງນ້ອຍໆ ທີ່ເຈົ້າສາມາດລອງເຮັດໄດ້.
              </p>
            </div>
          </div>

          <div className="flex gap-4 p-4 rounded-2xl bg-[#F9F8F5] border border-[#E5E1D8]/60">
            <div className="w-7 h-7 rounded-full bg-[#2D4C3E] text-[#F9F8F5] flex items-center justify-center shrink-0 text-sm font-semibold mt-0.5">
              4
            </div>
            <div>
              <h2 className="font-semibold text-sm sm:text-base text-[#2D4C3E]">
                ລະບົບບັນທຶກຮ່າງອັດຕະໂນມັດ (Autosave)
              </h2>
              <p className="text-xs sm:text-sm text-[#2D4C3E]/75 mt-1 leading-relaxed">
                ຖ້າເຈົ້າຕ້ອງພັກ ຫຼື ຕິດທຸລະ, ສາມາດປິດໜ້າຈໍແລ້ວກັບມາຕອບຕໍ່ໄດ້ຕະຫຼອດເວລາ ຂໍ້ມູນຮ່າງຈະບໍ່ສູນຫາຍ.
              </p>
            </div>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="pt-2 border-t border-[#E5E1D8]">
          <label className="flex items-start gap-3 p-4 rounded-2xl bg-[#F4EFEA] border border-[#E5E1D8] cursor-pointer hover:bg-[#eee8e1] transition-colors select-none">
            <input
              type="checkbox"
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-[#8D5B28] text-[#2D4C3E] focus:ring-[#8D5B28] cursor-pointer accent-[#2D4C3E]"
              id="consent-checkbox"
              aria-describedby="consent-description"
            />
            <div id="consent-description">
              <span className="font-semibold text-sm text-[#2D4C3E] block">
                ຂ້າພະເຈົ້າເຂົ້າໃຈ ແລະ ພ້ອມທີ່ຈະເລີ່ມຕົ້ນສຳຫຼວດຕົນເອງ
              </span>
              <span className="text-xs text-[#2D4C3E]/70 mt-0.5 block leading-relaxed">
                ຂ້າພະເຈົ້າຮັບຮູ້ວ່າການສຳຫຼວດນີ້ເປັນໄປເພື່ອການຮຽນຮູ້ຕົນເອງ, ບໍ່ແມ່ນການຕັດສິນອະນາຄົດ ແລະ ບໍ່ມີການເກັບຂໍ້ມູນສ່ວນຕົວ.
              </span>
            </div>
          </label>
        </div>

        {/* Error / Loading State */}
        {hasError && (
          <div className="pt-2">
            <ErrorBanner onRetry={begin} />
          </div>
        )}

        {busy && (
          <div className="pt-2">
            <Loading className="h-12" />
          </div>
        )}

        {/* Proceed Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-[#2D4C3E]/60 text-center sm:text-left">
            {!consented ? (
              <span className="flex items-center gap-1.5 text-[#7A3E2D]">
                <AlertCircle className="w-3.5 h-3.5" />
                ກະລຸນາກົດເລືອກຍອມຮັບເງື່ອນໄຂຂ້າງເທິງກ່ອນເລີ່ມຕົ້ນ
              </span>
            ) : (
              <span className="text-[#2D4C3E]">ພ້ອມແລ້ວ! ກົດປຸ່ມເລີ່ມຕົ້ນໄດ້ເລີຍ</span>
            )}
          </div>

          <button
            onClick={begin}
            disabled={!consented || busy}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all cursor-pointer ${
              consented && !busy
                ? "bg-[#2D4C3E] text-[#F9F8F5] hover:bg-[#233c31] shadow-md hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2D4C3E] active:scale-[0.985]"
                : "bg-[#E5E1D8] text-[#2D4C3E]/40 cursor-not-allowed"
            }`}
            aria-disabled={!consented || busy}
          >
            <span>ເລີ່ມຕົ້ນແບບສຳຫຼວດ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
