import Link from "next/link";
import type { Metadata } from "next";
import { Noto_Sans_Lao } from "next/font/google";
import "./globals.css";

const notoSansLao = Noto_Sans_Lao({
  subsets: ["lao"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PATHAI — ພື້ນທີ່ສຳຫຼວດ ແລະ ສະທ້ອນເສັ້ນທາງການຮຽນ-ການເຮັດວຽກ",
  description: "ພື້ນທີ່ຊ່ວຍໃຫ້ທ່ານເຂົ້າໃຈຕົນເອງ ແລະ ຄິດຫາເສັ້ນທາງການຮຽນ ຫຼື ການເຮັດວຽກ ບໍ່ແມ່ນການທຳນາຍ ບໍ່ມີຄະແນນ ບໍ່ຕັດສິນແທນທ່ານ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="lo" className={`h-full ${notoSansLao.className}`}>
      <body className="min-h-full flex flex-col selection:bg-stone-200 selection:text-stone-900">
        <header className="border-b border-stone-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-20">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="font-semibold text-lg tracking-wide text-stone-900 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-stone-900"></span>
              PATHAI
            </Link>
            <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
              v0.9.1 Pre-Cognitive
            </span>
          </div>
        </header>
        <div className="flex-1 flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
