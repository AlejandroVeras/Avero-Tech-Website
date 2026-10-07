import Image from "next/image"
import { Package, Store } from "lucide-react"
import { cn } from "@/lib/utils"

// Purely illustrative screens: skeleton blocks instead of invented figures.

const BAR_HEIGHTS = [38, 52, 44, 63, 58, 71, 49, 66, 80, 74, 88, 96]

export function LaptopMock({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full", className)} aria-hidden>
      <div className="rounded-t-[18px] rounded-b-[6px] bg-[#1d1d1f] p-[1.4%] pb-[2%] ring-1 ring-black/10 dark:ring-white/10">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-white dark:bg-[#111318]">
          <div className="absolute inset-0 flex">
            <div className="w-[17%] border-r border-black/5 dark:border-white/5 bg-[#f7f7f9] dark:bg-[#0c0e12] p-[2.2%] space-y-[9%]">
              <div className="h-[4%] min-h-2 w-[70%] rounded-full bg-[#0071e3]/80" />
              {[100, 85, 92, 78, 88, 70].map((w, i) => (
                <div key={i} className={cn("flex items-center gap-[8%]", i === 1 && "rounded-md bg-[#0071e3]/10 -mx-[6%] px-[6%] py-[4%]")}>
                  <div className={cn("aspect-square w-[14%] rounded-[3px]", i === 1 ? "bg-[#0071e3]" : "bg-black/15 dark:bg-white/15")} />
                  <div className={cn("h-1.5 rounded-full", i === 1 ? "bg-[#0071e3]/60" : "bg-black/10 dark:bg-white/10")} style={{ width: `${w * 0.55}%` }} />
                </div>
              ))}
            </div>
            <div className="flex-1 p-[2.6%] space-y-[2.6%]">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5 w-1/3">
                  <div className="h-2.5 w-3/4 rounded-full bg-black/80 dark:bg-white/80" />
                  <div className="h-1.5 w-1/2 rounded-full bg-black/15 dark:bg-white/15" />
                </div>
                <div className="flex gap-1.5">
                  <div className="h-4 w-14 rounded-full bg-[#0071e3]" />
                  <div className="h-4 w-4 rounded-full bg-black/10 dark:bg-white/10" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-[2.4%]">
                {[
                  { tone: "bg-[#0071e3]", w: "w-2/3" },
                  { tone: "bg-amber-400", w: "w-1/2" },
                  { tone: "bg-emerald-500", w: "w-3/5" },
                ].map((k, i) => (
                  <div key={i} className="rounded-lg border border-black/5 dark:border-white/5 bg-[#fafafa] dark:bg-white/[0.03] p-[7%] space-y-2">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("h-2 w-2 rounded-full", k.tone)} />
                      <div className="h-1.5 w-1/2 rounded-full bg-black/15 dark:bg-white/15" />
                    </div>
                    <div className={cn("h-3 rounded-full bg-black/75 dark:bg-white/75", k.w)} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-[1.6fr_1fr] gap-[2.4%] h-[52%]">
                <div className="rounded-lg border border-black/5 dark:border-white/5 p-[4%] flex flex-col">
                  <div className="h-1.5 w-1/4 rounded-full bg-black/15 dark:bg-white/15 mb-[4%]" />
                  <div className="flex-1 flex items-end gap-[3%]">
                    {BAR_HEIGHTS.map((h, i) => (
                      <div
                        key={i}
                        className={cn("flex-1 rounded-t-[3px]", i === BAR_HEIGHTS.length - 1 ? "bg-[#0071e3]" : "bg-[#0071e3]/25")}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-black/5 dark:border-white/5 p-[6%] space-y-[10%]">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="h-5 w-5 shrink-0 rounded-md bg-black/[0.06] dark:bg-white/[0.06]" />
                      <div className="flex-1 space-y-1">
                        <div className="h-1.5 w-4/5 rounded-full bg-black/20 dark:bg-white/20" />
                        <div className="h-1.5 w-2/5 rounded-full bg-black/10 dark:bg-white/10" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative -mx-[5%] h-[clamp(8px,1.8vw,16px)] rounded-b-[16px] bg-gradient-to-b from-[#e3e3e8] to-[#b9b9c0] dark:from-[#3b3b41] dark:to-[#232327]">
        <div className="absolute left-1/2 top-0 h-[40%] w-[14%] -translate-x-1/2 rounded-b-md bg-black/10" />
      </div>
    </div>
  )
}

export function PhoneMock({ images, className }: { images: string[]; className?: string }) {
  const tiles = Array.from({ length: 4 }, (_, i) => images.length > 0 ? images[i % images.length] : undefined)
  return (
    <div className={cn("relative", className)} aria-hidden>
      <div className="rounded-[2.2rem] bg-[#1d1d1f] p-[5%] ring-1 ring-black/10 dark:ring-white/15">
        <div className="relative aspect-[9/19] overflow-hidden rounded-[1.7rem] bg-[#f5f5f7] dark:bg-[#111318]">
          <div className="absolute left-1/2 top-[1.6%] h-[2.6%] w-[30%] -translate-x-1/2 rounded-full bg-[#1d1d1f]" />
          <div className="absolute inset-x-0 top-[6%] px-[7%] space-y-[6%]">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 shrink-0 rounded-full bg-gradient-to-br from-[#0071e3] to-[#2997ff] flex items-center justify-center">
                <Store className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="h-2 w-3/4 rounded-full bg-black/80 dark:bg-white/80" />
                <div className="h-1.5 w-1/2 rounded-full bg-black/15 dark:bg-white/15" />
              </div>
            </div>
            <div className="h-5 rounded-full bg-white dark:bg-white/10 ring-1 ring-black/5" />
            <div className="grid grid-cols-2 gap-[6%]">
              {tiles.map((src, i) => (
                <div key={i} className="rounded-xl bg-white dark:bg-white/[0.06] p-[7%] space-y-1.5 ring-1 ring-black/5 dark:ring-white/5">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-[#f5f5f7] dark:bg-white/5 flex items-center justify-center">
                    {src ? (
                      <Image src={src} alt="" fill sizes="80px" className="object-contain p-1" />
                    ) : (
                      <Package className="h-1/3 w-1/3 text-black/15 dark:text-white/20" />
                    )}
                  </div>
                  <div className="h-1.5 w-4/5 rounded-full bg-black/25 dark:bg-white/25" />
                  <div className="h-2 w-1/2 rounded-full bg-black/70 dark:bg-white/70" />
                </div>
              ))}
            </div>
            <div className="h-7 rounded-full bg-[#25D366] flex items-center justify-center">
              <div className="h-1.5 w-1/3 rounded-full bg-white/90" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
