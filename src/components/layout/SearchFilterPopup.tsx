import { useRef, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import classNames from "classnames";

import { Icon, Icons } from "@/components/Icon";

export interface FilterOptions {
  contentTypes: string[];
  genres: string[];
  years: [number, number];
  ratings: [number, number];
  status: string[];
}

interface SearchFilterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  anchorElement: HTMLElement | null;
}

const GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Romance",
  "Sci-Fi",
  "Thriller",
  "Animation",
  "Documentary",
];

const CONTENT_TYPES = [
  { id: "movie", label: "Movies" },
  { id: "series", label: "TV Shows" },
  { id: "anime", label: "Anime" },
];

const STATUS_OPTIONS = [
  { id: "upcoming", label: "Upcoming" },
  { id: "released", label: "Released" },
  { id: "ongoing", label: "Ongoing" },
];

export function SearchFilterPopup({
  isOpen,
  onClose,
  onApplyFilters,
  anchorElement,
}: SearchFilterPopupProps) {
  const { t } = useTranslation();
  const popupRef = useRef<HTMLDivElement>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    contentTypes: [],
    genres: [],
    years: [1990, new Date().getFullYear()],
    ratings: [0, 10],
    status: [],
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        anchorElement &&
        !anchorElement.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose, anchorElement]);

  const handleContentTypeChange = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter((t) => t !== type)
        : [...prev.contentTypes, type],
    }));
  };

  const handleGenreChange = (genre: string) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleStatusChange = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
  };

  const handleYearChange = (type: "min" | "max", value: number) => {
    setFilters((prev) => ({
      ...prev,
      years:
        type === "min"
          ? [Math.min(value, prev.years[1]), prev.years[1]]
          : [prev.years[0], Math.max(value, prev.years[0])],
    }));
  };

  const handleRatingChange = (type: "min" | "max", value: number) => {
    setFilters((prev) => ({
      ...prev,
      ratings:
        type === "min"
          ? [Math.min(value, prev.ratings[1]), prev.ratings[1]]
          : [prev.ratings[0], Math.max(value, prev.ratings[0])],
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      contentTypes: [],
      genres: [],
      years: [1990, new Date().getFullYear()],
      ratings: [0, 10],
      status: [],
    });
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className={classNames(
        "fixed z-50 bg-dropdown-background border border-type-divider rounded-lg shadow-2xl",
        "w-[90vw] max-w-md max-h-[80vh] overflow-y-auto",
        "animate-fadeIn"
      )}
      style={{
        right: "1rem",
        top: anchorElement
          ? `${anchorElement.getBoundingClientRect().bottom + 12}px`
          : "auto",
      }}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {t("search.filters.title") || "Filters"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-dropdown-hoverBackground rounded transition-colors"
          >
            <Icon icon={Icons.x} className="text-xl" />
          </button>
        </div>

        {/* Content Type Filter */}
        <div>
          <h4 className="text-sm font-semibold text-type-emphasis mb-3">
            {t("search.filters.contentType") || "Content Type"}
          </h4>
          <div className="space-y-2">
            {CONTENT_TYPES.map((type) => (
              <label
                key={type.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-dropdown-hoverBackground p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.contentTypes.includes(type.id)}
                  onChange={() => handleContentTypeChange(type.id)}
                  className="w-4 h-4 rounded border-type-divider"
                />
                <span className="text-sm text-white">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Genre Filter */}
        <div>
          <h4 className="text-sm font-semibold text-type-emphasis mb-3">
            {t("search.filters.genres") || "Genres"}
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {GENRES.map((genre) => (
              <label
                key={genre}
                className="flex items-center gap-2 cursor-pointer hover:bg-dropdown-hoverBackground p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.genres.includes(genre)}
                  onChange={() => handleGenreChange(genre)}
                  className="w-4 h-4 rounded border-type-divider"
                />
                <span className="text-sm text-white">{genre}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Year Range Filter */}
        <div>
          <h4 className="text-sm font-semibold text-type-emphasis mb-3">
            {t("search.filters.yearRange") || "Release Year"}
          </h4>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-type-secondary mb-1 block">
                From
              </label>
              <input
                type="number"
                min="1900"
                max={filters.years[1]}
                value={filters.years[0]}
                onChange={(e) => handleYearChange("min", parseInt(e.target.value))}
                className="w-full bg-dropdown-hoverBackground border border-type-divider rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-type-secondary mb-1 block">To</label>
              <input
                type="number"
                min={filters.years[0]}
                max={new Date().getFullYear()}
                value={filters.years[1]}
                onChange={(e) => handleYearChange("max", parseInt(e.target.value))}
                className="w-full bg-dropdown-hoverBackground border border-type-divider rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <h4 className="text-sm font-semibold text-type-emphasis mb-3">
            {t("search.filters.rating") || "Rating"}
          </h4>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-xs text-type-secondary mb-1 block">
                Min
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={filters.ratings[0]}
                onChange={(e) =>
                  handleRatingChange("min", parseFloat(e.target.value))
                }
                className="w-full bg-dropdown-hoverBackground border border-type-divider rounded px-3 py-2 text-white text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-type-secondary mb-1 block">
                Max
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={filters.ratings[1]}
                onChange={(e) =>
                  handleRatingChange("max", parseFloat(e.target.value))
                }
                className="w-full bg-dropdown-hoverBackground border border-type-divider rounded px-3 py-2 text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Status Filter */}
        <div>
          <h4 className="text-sm font-semibold text-type-emphasis mb-3">
            {t("search.filters.status") || "Status"}
          </h4>
          <div className="space-y-2">
            {STATUS_OPTIONS.map((status) => (
              <label
                key={status.id}
                className="flex items-center gap-3 cursor-pointer hover:bg-dropdown-hoverBackground p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.status.includes(status.id)}
                  onChange={() => handleStatusChange(status.id)}
                  className="w-4 h-4 rounded border-type-divider"
                />
                <span className="text-sm text-white">{status.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-type-divider">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-dropdown-hoverBackground hover:bg-opacity-80 rounded transition-all"
          >
            {t("search.filters.reset") || "Reset"}
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-buttons-primary hover:bg-buttons-primaryHover rounded transition-all"
          >
            {t("search.filters.apply") || "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
