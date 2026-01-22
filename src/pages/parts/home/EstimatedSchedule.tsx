import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { WideContainer } from "@/components/layout/WideContainer";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { Icons } from "@/components/Icon";

interface ScheduleItem {
  id: string;
  title: string;
  type: "movie" | "tv" | "anime";
  episodeNumber?: number;
  releaseTime: string;
  date: Date;
  posterUrl?: string;
}

export function EstimatedSchedule() {
  const { t } = useTranslation();
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    // Generate mock schedule data - in a real implementation, this would come from your API
    const generateSchedule = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const items: ScheduleItem[] = [];
      const mockData = [
        { title: "New Movie Release", type: "movie" as const, time: "14:00" },
        { title: "Episode 5", type: "tv" as const, time: "20:00", ep: 5 },
        { title: "Anime Series", type: "anime" as const, time: "22:00", ep: 12 },
        { title: "Blockbuster Film", type: "movie" as const, time: "16:30" },
        { title: "Series Finale", type: "tv" as const, time: "19:00", ep: 10 },
      ];

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        
        mockData.forEach((data, idx) => {
          if (i === idx % 3 || i === 0) {
            items.push({
              id: `${i}-${idx}`,
              title: data.title,
              type: data.type,
              episodeNumber: data.ep,
              releaseTime: data.time,
              date: date,
            });
          }
        });
      }

      return items;
    };

    setScheduleItems(generateSchedule());
  }, []);

  const groupedByDate = scheduleItems.reduce(
    (acc, item) => {
      const dateKey = item.date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(item);
      return acc;
    },
    {} as Record<string, ScheduleItem[]>
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case "movie":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "tv":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "anime":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <section className="py-16 md:py-24">
      <WideContainer ultraWide classNames="!px-3 md:!px-9">
        <SectionHeading
          title={t("home.schedule.title") || "Estimated Schedule"}
          icon={Icons.CALENDAR}
        />
        
        <div className="grid gap-6">
          {Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date} className="space-y-3">
              <h3 className="text-lg font-semibold text-type-emphasis">{date}</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-largeCard-background rounded-lg p-4 border border-type-divider hover:border-type-emphasis transition-colors duration-200 hover:scale-105"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(
                              item.type
                            )}`}
                          >
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                        </div>
                        <h4 className="font-semibold text-white truncate">
                          {item.title}
                        </h4>
                        {item.episodeNumber && (
                          <p className="text-sm text-type-secondary">
                            Episode {item.episodeNumber}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-type-divider">
                      <p className="text-sm font-medium text-type-link">
                        {item.releaseTime}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </WideContainer>
    </section>
  );
}
