import Link from "next/link";
import { UI_COPY } from "@/content/copy";

export default function LandingPage() {
  return (
    <main className="flex-1 bg-[#FAF9F5] px-4 py-8 sm:px-6 flex flex-col justify-center">
      <div className="mx-auto w-full max-w-2xl py-6 sm:py-12">
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-200/70 text-stone-700 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>ເຄື່ອງມືສຳຫຼວດທິດທາງສ່ວນບຸກຄົນ</span>
        </div>

        {/* Hero Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-stone-900 leading-[1.25]">
          {UI_COPY.landing.h1}
        </h1>
        
        <p className="mt-5 text-lg sm:text-xl text-stone-700 leading-relaxed font-normal">
          {UI_COPY.landing.sub}
        </p>

        {/* Reassurance banner */}
        <div className="mt-8 rounded-2xl bg-amber-50/70 border border-amber-200/80 p-4 sm:p-5 text-stone-800">
          <div className="flex items-start gap-3">
            <span className="text-amber-800 text-lg leading-none mt-0.5">✦</span>
            <div>
              <p className="text-base font-medium text-stone-900">
                {UI_COPY.landing.not}
              </p>
              <p className="mt-1 text-sm text-stone-600 leading-relaxed">
                ລະບົບນີ້ຖືກອອກແບບມາເພື່ອຊ່ວຍສະທ້ອນຄວາມຄິດ ບໍ່ແມ່ນການຕັດສິນ ທ່ານເປັນຜູ້ເລືອກ ແລະ ຕັດສິນໃຈເສັ້ນທາງຂອງຕົນເອງສະເໝີ
              </p>
            </div>
          </div>
        </div>

        {/* 3 Step Flow */}
        <div className="mt-10 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-500">
            ຂັ້ນຕອນການສຳຫຼວດ
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white border border-stone-200/90 p-4 sm:p-5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold mb-3">
                1
              </span>
              <p className="text-sm font-medium text-stone-900">ຕອບ 28 ຄຳຖາມ</p>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                ໃຊ້ເວລາປະມານ 15–20 ນາທີ ຕອບຕາມຄວາມຮູ້ສຶກຈິງ
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-stone-200/90 p-4 sm:p-5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold mb-3">
                2
              </span>
              <p className="text-sm font-medium text-stone-900">ວິເຄາະຮູບແບບ</p>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                ລະບົບຊອກຫາຈຸດເຊື່ອມໂຍງ ຄວາມສົນໃຈ ແລະ ທັກສະ
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-stone-200/90 p-4 sm:p-5">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-stone-100 text-stone-800 text-xs font-semibold mb-3">
                3
              </span>
              <p className="text-sm font-medium text-stone-900">ພື້ນທີ່ສະທ້ອນຄິດ</p>
              <p className="mt-1 text-xs text-stone-500 leading-relaxed">
                ເຫັນທາງເລືອກ ແລະ ຂໍ້ແນະນຳໃນການລອງປະຕິບັດ
              </p>
            </div>
          </div>
        </div>

        {/* Start Action */}
        <div className="mt-10 pt-4 flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/introduction"
            className="w-full sm:w-auto btn-primary text-center justify-center shadow-sm"
          >
            {UI_COPY.landing.start}
            <span className="ml-2">→</span>
          </Link>
          <span className="text-xs text-stone-500 text-center sm:text-left">
            ບໍ່ຕ້ອງລົງທະບຽນ · ບໍ່ເກັບຂໍ້ມູນສ່ວນຕົວ
          </span>
        </div>
      </div>
    </main>
  );
}
