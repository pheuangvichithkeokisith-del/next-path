import type { Metadata } from "next";
import { Noto_Sans_Lao, Noto_Sans_Lao_Looped, Noto_Serif_Lao } from "next/font/google";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import "./globals.css";

const notoSansLao = Noto_Sans_Lao({
  subsets: ["lao"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-noto-sans-lao",
});

const notoSerifLao = Noto_Serif_Lao({
  subsets: ["lao"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-noto-serif-lao",
});

const notoSansLaoLooped = Noto_Sans_Lao_Looped({
  subsets: ["lao"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-lao-province",
});

export const metadata: Metadata = {
  title: "Next-path — ພື້ນທີ່ສຳຫຼວດ ແລະ ສະທ້ອນເສັ້ນທາງຊີວິດສຳລັບໄວໜຸ່ມລາວ",
  description: "ພື້ນທີ່ປອດໄພຊ່ວຍໃຫ້ໄວໜຸ່ມລາວເຂົ້າໃຈຕົນເອງ ແລະ ຄົ້ນພົບເສັ້ນທາງການຮຽນ-ອາຊີບຢ່າງບໍ່ກົດດັນ ບໍ່ມີຄະແນນ ບໍ່ຕັດສິນ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="lo"
      data-scroll-behavior="smooth"
      className={`h-full ${notoSansLao.className} ${notoSansLao.variable} ${notoSerifLao.variable} ${notoSansLaoLooped.variable}`}
    >
      <body className="min-h-full flex flex-col bg-[#F9F8F5] paper-grain text-[#2D4C3E] selection:bg-[#EAE6DC] selection:text-[#1D2229]">
        <a className="skip-link" href="#main-content">
          ໄປຫາເນື້ອຫາຫຼັກ
        </a>
        <Header />
        <div id="main-content" tabIndex={-1} className="flex-1 flex flex-col">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
