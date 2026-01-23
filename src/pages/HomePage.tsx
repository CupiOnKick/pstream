import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { To, useNavigate } from "react-router-dom";

import { WideContainer } from "@/components/layout/WideContainer";
import { useDebounce } from "@/hooks/useDebounce";
import { useRandomTranslation } from "@/hooks/useRandomTranslation";
import { useSearchQuery } from "@/hooks/useSearchQuery";
import type { FeaturedMedia } from "@/pages/discover/components/FeaturedCarousel";
import { FeaturedCarousel } from "@/pages/discover/components/FeaturedCarousel";
import DiscoverContent from "@/pages/discover/discoverContent";
import { HomeLayout } from "@/pages/layouts/HomeLayout";
import { BookmarksCarousel } from "@/pages/parts/home/BookmarksCarousel";
import { BookmarksPart } from "@/pages/parts/home/BookmarksPart";
import { EstimatedSchedule } from "@/pages/parts/home/EstimatedSchedule";
import { HeroPart } from "@/pages/parts/home/HeroPart";
import { WatchingCarousel } from "@/pages/parts/home/WatchingCarousel";
import { WatchingPart } from "@/pages/parts/home/WatchingPart";
import { SearchListPart } from "@/pages/parts/search/SearchListPart";
import { SearchLoadingPart } from "@/pages/parts/search/SearchLoadingPart";
import { conf } from "@/setup/config";
import { useOverlayStack } from "@/stores/interface/overlayStack";
import { usePreferencesStore } from "@/stores/preferences";
import { MediaItem } from "@/utils/mediaTypes";

import { Button } from "./About";
import { AdsPart } from "./parts/home/AdsPart";
import { SupportBar } from "./parts/home/SupportBar";

function useSearch(search: string) {
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const isSearching = search !== "";
    setSearching(isSearching);
    setLoading(isSearching);

    if (isSearching) {
      window.scrollTo(0, 0);
    }
  }, [search]);

  useEffect(() => {
    setLoading(false);
  }, [debouncedSearch]);

  return { loading, searching };
}

export function HomePage() {
  const { t } = useTranslation();
  const { t: randomT } = useRandomTranslation();
  const emptyText = randomT("home.search.empty");

  const navigate = useNavigate();
  const [showBg, setShowBg] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showWatching, setShowWatching] = useState(false);

  const searchParams = useSearchQuery();
  const [search] = searchParams;
  const searchState = useSearch(search);

  const { showModal } = useOverlayStack();

  const enableDiscover = usePreferencesStore((state) => state.enableDiscover);
  const enableFeatured = usePreferencesStore((state) => state.enableFeatured);
  const enableCarouselView = usePreferencesStore(
    (state) => state.enableCarouselView,
  );
  const enableLowPerformanceMode = usePreferencesStore(
    (state) => state.enableLowPerformanceMode,
  );
  const homeSectionOrder = usePreferencesStore(
    (state) => state.homeSectionOrder,
  );

  const carouselRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleClick = (path: To) => {
    window.scrollTo(0, 0);
    navigate(path);
  };

  const handleShowDetails = async (media: MediaItem | FeaturedMedia) => {
    showModal("details", {
      id: Number(media.id),
      type: media.type === "movie" ? "movie" : "show",
    });
  };

  const renderHomeSections = () => {
    const sections = homeSectionOrder.map((section) => {
      switch (section) {
        case "watching":
          return enableCarouselView ? (
            <WatchingCarousel
              key="watching"
              carouselRefs={carouselRefs}
              onShowDetails={handleShowDetails}
            />
          ) : (
            <WatchingPart
              key="watching"
              onItemsChange={setShowWatching}
              onShowDetails={handleShowDetails}
            />
          );

        case "bookmarks":
          return enableCarouselView ? (
            <BookmarksCarousel
              key="bookmarks"
              carouselRefs={carouselRefs}
              onShowDetails={handleShowDetails}
            />
          ) : (
            <BookmarksPart
              key="bookmarks"
              onItemsChange={setShowBookmarks}
              onShowDetails={handleShowDetails}
            />
          );

        default:
          return null;
      }
    });

    return enableCarouselView ? (
      <WideContainer ultraWide classNames="!px-3 md:!px-9">
        {sections}
      </WideContainer>
    ) : (
      <WideContainer>
        <div className="flex flex-col gap-8">{sections}</div>
      </WideContainer>
    );
  };

  return (
    <HomeLayout showBg={showBg}>
      <div className="mb-2">
        <Helmet>
          <style>{`
            html, body {
              scrollbar-gutter: stable;
            }
          `}</style>
          <title>{t("global.name")}</title>
        </Helmet>

        {enableFeatured ? (
          <FeaturedCarousel
            forcedCategory="movies"
            onShowDetails={handleShowDetails}
            searching={searchState.searching}
            shorter
          >
            <HeroPart
              searchParams={searchParams}
              setIsSticky={setShowBg}
              isInFeatured
            />
          </FeaturedCarousel>
        ) : (
          <HeroPart
            searchParams={searchParams}
            setIsSticky={setShowBg}
            showTitle
          />
        )}

        {conf().SHOW_SUPPORT_BAR && <SupportBar />}
        {conf().SHOW_AD && <AdsPart />}
      </div>

      {search && (
        <WideContainer>
          {searchState.loading ? (
            <SearchLoadingPart />
          ) : (
            searchState.searching && (
              <SearchListPart
                searchQuery={search}
                onShowDetails={handleShowDetails}
              />
            )
          )}
        </WideContainer>
      )}

      {!search && renderHomeSections()}

      <WideContainer ultraWide classNames="!px-3 md:!px-9">
        {!(showBookmarks || showWatching) &&
        (!enableDiscover || enableLowPerformanceMode) ? (
          <div className="flex translate-y-[-30px] flex-col items-center justify-center pt-20">
            <p className="pb-3 text-[18.5px]">{emptyText}</p>
          </div>
        ) : null}

        {enableDiscover &&
          (enableFeatured ? (
            <div className="pb-4" />
          ) : showBookmarks || showWatching ? (
            <div className="pb-10" />
          ) : (
            <div className="pb-20" />
          ))}

        {enableDiscover && !search && !enableLowPerformanceMode ? (
          <DiscoverContent />
        ) : (
          <div className="flex h-40 flex-col items-center justify-center space-y-4">
            {!search && !enableLowPerformanceMode && (
              <Button
                className="mt-3 rounded-xl bg-largeCard-background p-[0.35em] text-[18px] text-type-dimmed"
                onClick={() => handleClick("/discover")}
              >
                {t("home.search.discover")}
              </Button>
            )}
          </div>
        )}
      </WideContainer>

      {!search && !enableLowPerformanceMode && <EstimatedSchedule />}
    </HomeLayout>
  );
}
