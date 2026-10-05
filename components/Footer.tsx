"use client";

import React from "react";
import Link from "next/link";
import { Compass, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#E5E1D8] bg-[#F4EFEA]/70 py-12 text-[#2D4C3E]/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-[#E5E1D8]/60">
          {/* Brand Philosophy */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#2D4C3E] text-[#F9F8F5] flex items-center justify-center shadow-2xs">
                <Compass className="w-4 h-4 text-[#E5E1D8]" />
              </div>
              <span className="font-bold text-lg text-[#2D4C3E]">Next-path</span>
            </div>
            <p className="text-sm leading-relaxed text-[#2D4C3E]/75">
              ພື້ນທີ່ປອດໄພສຳລັບໄວໜຸ່ມລາວ ອາຍຸ 15 ປີຂຶ້ນໄປ ໃນການສຳຫຼວດຄວາມສົນໃຈ, ເຂົ້າໃຈຄຸນຄ່າໃນຕົນເອງ ແລະ ທົດລອງເສັ້ນທາງຊີວິດຢ່າງບໍ່ກົດດັນ.
            </p>
          </div>

          {/* Core Commitments */}
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-[#2D4C3E] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#8D5B28]" />
              <span>ຄຳໝັ້ນສັນຍາຕໍ່ຜູ້ໃຊ້</span>
            </h4>
            <ul className="space-y-2 text-[#2D4C3E]/75">
              <li>• ບໍ່ແມ່ນບົດສອບເສັງ ແລະ ບໍ່ມີຄຳຕອບຖືກ ຫຼື ຜິດ</li>
              <li>• ບໍ່ຕັດສິນ ຫຼື ບອກວ່າເຈົ້າຕ້ອງເປັນຫຍັງ</li>
              <li>• ບໍ່ຂໍຊື່, ອີເມວ ຫຼື ຂໍ້ມູນລະບຸຕົວຕົນ</li>
              <li>• ຄຳຕອບຈະຖືກນຳໄປສ້າງພາບລວມຄວາມສາມາດ ແລະ ທິດທາງ ໂດຍບໍ່ຕ້ອງລະບຸຊື່ ຫຼື ອີເມວ</li>
            </ul>
          </div>

          {/* Useful Navigation Links */}
          <div className="space-y-3 text-sm">
            <h4 className="font-semibold text-[#2D4C3E]">ເມນູທີ່ເປັນປະໂຫຍດ</h4>
            <div className="flex flex-col space-y-2 text-[#2D4C3E]/75">
              <Link
                href="/"
                className="text-left hover:text-[#2D4C3E] transition-colors"
              >
                ໜ້າຫຼັກ (Home)
              </Link>
              <Link
                href="/introduction"
                className="text-left hover:text-[#2D4C3E] transition-colors"
              >
                ເລີ່ມຕົ້ນສຳຫຼວດຕົນເອງ (Start Exploration)
              </Link>
              <Link
                href="/feedback"
                className="text-left hover:text-[#2D4C3E] transition-colors"
              >
                ສົ່ງຄຳຕິຊົມ ແລະ ຄວາມຄິດເຫັນ (Feedback)
              </Link>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#2D4C3E]/60 gap-3">
          <p>Next-path · ສ້າງຂຶ້ນດ້ວຍຄວາມເຂົ້າໃຈ ແລະ ຄວາມຮັກເພື່ອໄວໜຸ່ມລາວ</p>
          <div className="flex items-center gap-1.5">
            <span>ເວັບໄຊສຳຫຼວດຕົນເອງ</span>
            <Heart className="w-3.5 h-3.5 text-[#7A3E2D] inline fill-current" />
            <span>ໂດຍບໍ່ມີການຕັດສິນ</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
