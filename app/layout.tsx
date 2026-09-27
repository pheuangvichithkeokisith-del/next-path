import type { Metadata } from "next";
import { Noto_Sans_Lao, Noto_Sans_Lao_Looped } from "next/font/google";
import Header from "@/components/Header";
import "./globals.css";

const notoSansLao = Noto_Sans_Lao({
  subsets: ["lao"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoSansLaoLooped = Noto_Sans_Lao_Looped({
  subsets: ["lao"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-lao-province",
});

export const metadata: Metadata = {
  title: "Next-path — ພື້ນທີ່ສຳຫຼວດ ແລະ ສະທ້ອນເສັ້ນທາງການຮຽນ-ການເຮັດວຽກ",
  description: "ພື້ນທີ່ຊ່ວຍໃຫ້ທ່ານເຂົ້າໃຈຕົນເອງ ແລະ ຄິດຫາເສັ້ນທາງການຮຽນ ຫຼື ການເຮັດວຽກ ບໍ່ແມ່ນການທຳນາຍ ບໍ່ມີຄະແນນ ບໍ່ຕັດສິນແທນທ່ານ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lo" data-scroll-behavior="smooth" className={`h-full ${notoSansLao.className} ${notoSansLaoLooped.variable}`}>
      <body className="min-h-full flex flex-col bg-[#F9F8F5] text-[#1A1E24] selection:bg-[#EAE6DC] selection:text-[#1D2229]">
        <a className="skip-link" href="#main-content">
          ໄປຫາເນື້ອຫາຫຼັກ
        </a>
        <Header />
        <div id="main-content" tabIndex={-1} className="flex-1 flex flex-col">
          {children}
        </div>
        
        {/* Quiet, Grounded Footer */}
        <footer className="py-8 px-4 sm:px-6 subtle-border-t bg-[#F4F1EA] text-[#786E5E] text-xs">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <span className="font-bold text-[#1D2229]">Next-path</span>
              <span className="mx-2">•</span>
              <span>ພື້ນທີ່ສຳຫຼວດຕົນເອງ ສຳລັບໄວໜຸ່ມລາວ</span>
            </div>

            <div className="text-[11px] text-[#938A7A]">
              ບໍ່ຮ້ອງຂໍຊື່ ຫຼື ອີເມວ • ໃຊ້ການເຂົ້າໃຊ້ງານແບບບໍ່ລະບຸຕົວຕົນ
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
