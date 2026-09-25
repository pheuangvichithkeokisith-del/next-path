"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isSessionNotFound } from "@/api/errors";
import { getSessionStatus } from "@/api/session";
import ErrorBanner from "@/components/ErrorBanner";
import { clearSessionId, useSessionId } from "@/hooks/useSession";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface SpatialNode {
  id: string;
  cluster: 1 | 2 | 3 | 4;
  labelLo: string;
  x: number; // percentage
  y: number; // percentage
  connections: string[];
}

export default function ProcessingPage() {
  const router = useRouter();
  const { sessionId, resolved } = useSessionId();
  const [hasError, setHasError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const [phase, setPhase] = useState<number>(1);
  const [selectedNode, setSelectedNode] = useState<SpatialNode | null>(null);
  const [readyToProceed, setReadyToProceed] = useState(false);

  const nodes: SpatialNode[] = [
    // Cluster 1: Daily Rhythms & Energy
    {
      id: "n1",
      cluster: 1,
      labelLo: "ສະມາທິຈາກການລົງມືເຮັດ",
      x: 24,
      y: 28,
      connections: ["n4", "n5"],
    },
    {
      id: "n2",
      cluster: 1,
      labelLo: "ພື້ນທີ່ສະຫງົບຟື້ນຟູພະລັງ",
      x: 18,
      y: 44,
      connections: ["n1", "n7"],
    },
    {
      id: "n3",
      cluster: 1,
      labelLo: "ແສງທຳມະຊາດ ແລະ ລົມໂກກ",
      x: 32,
      y: 40,
      connections: ["n1", "n8"],
    },

    // Cluster 2: Craft & Ways of Solving
    {
      id: "n4",
      cluster: 2,
      labelLo: "ວັດສະດຸຈິງ & ງານສາມມິຕິ",
      x: 72,
      y: 26,
      connections: ["n5", "n11"],
    },
    {
      id: "n5",
      cluster: 2,
      labelLo: "ການປັບປຸງ ແລະ ສ້ອມແປງ",
      x: 82,
      y: 42,
      connections: ["n6"],
    },
    {
      id: "n6",
      cluster: 2,
      labelLo: "ການແຕ້ມແຜນວາດຈັດພື້ນທີ່",
      x: 65,
      y: 45,
      connections: ["n1", "n4"],
    },

    // Cluster 3: Community & Roots
    {
      id: "n7",
      cluster: 3,
      labelLo: "ຜູ້ຢູ່ເບື້ອງຫຼັງທີ່ໝັ້ນຄົງ",
      x: 22,
      y: 72,
      connections: ["n8", "n2"],
    },
    {
      id: "n8",
      cluster: 3,
      labelLo: "ຄວາມກະຕັນຍູຕໍ່ຄອບຄົວ",
      x: 35,
      y: 80,
      connections: ["n9", "n10"],
    },
    {
      id: "n9",
      cluster: 3,
      labelLo: "ຄວາມຜູກພັນກັບສາຍນ້ຳ & ທຳມະຊາດ",
      x: 26,
      y: 86,
      connections: ["n3"],
    },

    // Cluster 4: Tensions & Horizons
    {
      id: "n10",
      cluster: 4,
      labelLo: "ຄວາມປາຖະໜາໃນອິດສະຫຼະສ້າງສັນ",
      x: 68,
      y: 72,
      connections: ["n4", "n8"],
    },
    {
      id: "n11",
      cluster: 4,
      labelLo: "ງານຊ່າງຍືນຍົງຮ່ວມສະໄໝ",
      x: 80,
      y: 80,
      connections: ["n4", "n12"],
    },
    {
      id: "n12",
      cluster: 4,
      labelLo: "ຄຳຖາມໃນໃຈທີ່ຍັງບໍ່ໄດ້ບອກໃຜ",
      x: 70,
      y: 88,
      connections: ["n10", "n8"],
    },
  ];

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(2), 1200);
    const t2 = setTimeout(() => setPhase(3), 2600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (!resolved) return;
    if (!sessionId) {
      router.replace("/");
      return;
    }

    let active = true;
    let timer: number | undefined;

    const poll = () => {
      getSessionStatus(sessionId)
        .then(({ status }) => {
          if (!active) return;
          if (status === "completed") {
            setReadyToProceed(true);
            // Smooth short pause before auto transition
            timer = window.setTimeout(() => {
              if (active) router.replace("/report");
            }, 3000);
          } else if (status === "failed") {
            setHasError(true);
          } else {
            timer = window.setTimeout(poll, 2000);
          }
        })
        .catch((error: unknown) => {
          if (!active) return;
          if (isSessionNotFound(error)) {
            clearSessionId();
            router.replace("/");
          } else {
            setHasError(true);
          }
        });
    };

    poll();

    return () => {
      active = false;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [retryToken, router, resolved, sessionId]);

  const handleOpenReport = () => {
    if (!readyToProceed) return;
    router.replace("/report");
  };

  return (
    <main className="w-full min-h-[calc(100vh-8rem)] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Title & Atmosphere */}
      <div className="text-center max-w-2xl mx-auto mb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-[#796F5F] block mb-1.5">
          ການເຊື່ອມໂຍງຮູບແບບຄວາມຄິດ
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171A1F]">
          ສິ່ງທີ່ເຈົ້າແບ່ງປັນ ກຳລັງຕົກພຶກ ແລະ ເຊື່ອມຕໍ່ກັນ
        </h1>
        <p className="text-xs sm:text-sm text-[#675E4F] mt-2 leading-relaxed">
          ສັງເກດການຈັດກຸ່ມຂອງພະລັງງານ, ວິທີການລົງມືເຮັດ, ແລະ ຄວາມຮູ້ສຶກທີ່ມີຕໍ່ອະນາຄົດ.
        </p>
      </div>

      {/* Spatial Connection Map */}
      <div className="relative w-full aspect-4/3 sm:aspect-16/9 bg-white subtle-border rounded-3xl p-6 sm:p-10 shadow-xs overflow-hidden my-4">
        {/* SVG Relationship Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#E0DBD0] transition-opacity duration-1000">
          {phase >= 2 &&
            nodes.map((source) =>
              source.connections.map((targetId) => {
                const target = nodes.find((n) => n.id === targetId);
                if (!target) return null;
                return (
                  <line
                    key={`${source.id}-${target.id}`}
                    x1={`${source.x}%`}
                    y1={`${source.y}%`}
                    x2={`${target.x}%`}
                    y2={`${target.y}%`}
                    strokeWidth="1.2"
                    strokeDasharray="3 3"
                    className="opacity-75 transition-all duration-700"
                  />
                );
              })
            )}
        </svg>

        {/* 4 Thematic Region Labels */}
        <div className="absolute top-4 left-6 text-[11px] font-bold tracking-wider text-[#9E9585] uppercase">
          1. ຈັງຫວະ & ການພັກຜ່ອນ
        </div>
        <div className="absolute top-4 right-6 text-[11px] font-bold tracking-wider text-[#9E9585] uppercase text-right">
          2. ວັດສະດຸ & ການແກ້ໄຂ
        </div>
        <div className="absolute bottom-4 left-6 text-[11px] font-bold tracking-wider text-[#9E9585] uppercase">
          3. ຄອບຄົວ & ບ້ານເກີດ
        </div>
        <div className="absolute bottom-4 right-6 text-[11px] font-bold tracking-wider text-[#9E9585] uppercase text-right">
          4. ຄວາມລັງເລ & ຂອບຟ້າ
        </div>

        {/* Spatial Thought Nodes */}
        {nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group transition-all duration-500"
            >
              <div
                className={`px-3 py-1.5 rounded-full text-xs font-medium subtle-border whitespace-nowrap shadow-2xs flex items-center space-x-1.5 transition-all ${
                  isSelected
                    ? "bg-[#1D2229] text-white border-[#1D2229] scale-110 z-20"
                    : "bg-[#F9F8F5] text-[#2C271F] hover:bg-white hover:border-[#B5AEA0]"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    node.cluster === 1
                      ? "bg-[#2D4C3E]"
                      : node.cluster === 2
                      ? "bg-[#8D5B28]"
                      : node.cluster === 3
                      ? "bg-[#3F4D5A]"
                      : "bg-[#7A3E2D]"
                  }`}
                />
                <span>{node.labelLo}</span>
              </div>
            </div>
          );
        })}

        {/* Active Node Detail Drawer if clicked */}
        {selectedNode && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#1A1E24] text-white px-5 py-3 rounded-2xl shadow-xl text-xs max-w-sm w-11/12 text-center z-30">
            <p className="font-semibold text-sm mb-1">{selectedNode.labelLo}</p>
            <p className="text-[#B9B3A2]">
              ເຊື່ອມໂຍງກັບຫົວຂໍ້ອື່ນໆ ໃນມິຕິການສຳຫຼວດດຽວກັນ
            </p>
          </div>
        )}
      </div>

      {/* Progress & Next Step Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 subtle-border-t">
        <div className="flex items-center space-x-2 text-xs text-[#6B6252]">
          <CheckCircle2 className="w-4 h-4 text-[#2D4C3E]" />
          <span>
            {readyToProceed
              ? "ການຈັດລຽງຂໍ້ມູນສຳເລັດແລ້ວ ພ້ອມສຳລັບການເປີດບົດສະທ້ອນ"
              : "ລະບົບກຳລັງປະມວນຜົນຮູບແບບຄຳຕອບ..."}
          </span>
        </div>

        <button
          onClick={handleOpenReport}
          disabled={!readyToProceed}
          aria-disabled={!readyToProceed}
          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center space-x-2 shadow-xs text-xs sm:text-sm ${
            readyToProceed
              ? "bg-[#2D4C3E] hover:bg-[#21382E] text-white cursor-pointer"
              : "bg-[#E5E1D8] text-[#8A8170] cursor-not-allowed"
          }`}
        >
          <span>
            {readyToProceed
              ? "ເປີດເບິ່ງບົດສະທ້ອນ (Open Reflection)"
              : "ກຳລັງກວດສອບຜົນ..."}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {hasError ? (
        <div className="text-left pt-4">
          <ErrorBanner onRetry={() => setRetryToken((t) => t + 1)} />
        </div>
      ) : null}
    </main>
  );
}
