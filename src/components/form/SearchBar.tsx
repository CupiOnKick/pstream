import c from "classnames";
import { forwardRef, useEffect, useRef, useState } from "react";

import { Flare } from "@/components/utils/Flare";
import { Icon, Icons } from "../Icon";
import { FilterOptions, SearchFilterPopup } from "../layout/SearchFilterPopup";
import { TextInputControl } from "../text-inputs/TextInputControl";

export interface SearchBarProps {
  placeholder?: string;
  onChange: (value: string, force: boolean) => void;
  onUnFocus: (newSearch?: string) => void;
  value: string;
  isSticky?: boolean;
  isInFeatured?: boolean;
  hideTooltip?: boolean;
  onFiltersApply?: (filters: FilterOptions) => void;
}

export const SearchBarInput = forwardRef<HTMLInputElement, SearchBarProps>(
  (props, ref) => {
    const [focused, setFocused] = useState(false);
    const [lightTheme, setLightTheme] = useState(
      Boolean(props.isInFeatured) && window.scrollY < 600,
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const filterButtonRef = useRef<HTMLButtonElement>(null);

    const [showTooltip, setShowTooltip] = useState(false);
    const [showFilterPopup, setShowFilterPopup] = useState(false);

    function setSearch(value: string) {
      props.onChange(value, true);
    }

    useEffect(() => {
      const handleScroll = () => {
        setLightTheme(Boolean(props.isInFeatured) && window.scrollY < 600);
      };

      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, [props.isInFeatured]);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          props.onUnFocus();
          setFocused(false);
        }
      }

      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, [props]);

    const handleFilterApply = (filters: FilterOptions) => {
      props.onFiltersApply?.(filters);
    };

    return (
      <>
        <div
          ref={containerRef}
          className={c(
            "relative transition-[colors,box-shadow] outline-0 duration-200",
            lightTheme
              ? "before:from-white/10 before:to-white/5 hover:before:from-white/20 hover:before:to-white/10 focus-within:before:from-white/30 focus-within:before:to-white/20"
              : "before:from-type-divider/20 before:to-type-divider/10 hover:before:from-type-divider/40 hover:before:to-type-divider/30 focus-within:before:from-type-divider/60 focus-within:before:to-type-divider/40",
            "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:pointer-events-none",
            focused && !showTooltip && "ring-2 ring-type-link ring-opacity-50",
          )}
        >
          <div
            className={c(
              "relative rounded-full backdrop-blur-sm",
              lightTheme ? "bg-white/5" : "bg-type-divider/10",
            )}
          >
            <div className="relative flex items-center pr-2 pl-4 py-3">
              <Icon
                icon={Icons.SEARCH}
                className={c(
                  "mr-3 text-xl transition-colors duration-200",
                  lightTheme ? "text-white/60" : "text-type-secondary",
                )}
              />

              <TextInputControl
                ref={ref}
                value={props.value}
                placeholder={props.placeholder}
                onChange={(value) => props.onChange(value, false)}
                onFocus={() => {
                  setFocused(true);
                  setShowTooltip(false);
                }}
                className={c(
                  "bg-transparent w-full outline-0 placeholder:transition-colors placeholder:duration-200",
                  lightTheme
                    ? "placeholder:text-white/40 text-white"
                    : "placeholder:text-type-secondary text-type-emphasis",
                )}
              />

              {/* Filter Button */}
              <button
                ref={filterButtonRef}
                type="button"
                onClick={() => setShowFilterPopup(!showFilterPopup)}
                title="Advanced filters"
                className={c(
                  "ml-2 p-2 rounded-full transition-all duration-200",
                  "hover:bg-type-divider/20 focus:outline-none focus:ring-2 focus:ring-type-link",
                  showFilterPopup
                    ? "bg-type-link/20 text-type-link"
                    : lightTheme
                      ? "text-white/60 hover:text-white/80"
                      : "text-type-secondary hover:text-type-emphasis",
                )}
              >
                <Icon icon={Icons.SETTINGS} className="text-lg" />
              </button>

              {props.value.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    props.onUnFocus("");
                  }}
                  className={c(
                    "ml-1 p-2 rounded-full transition-colors duration-200",
                    lightTheme
                      ? "text-white/60 hover:text-white/80"
                      : "text-type-secondary hover:text-type-emphasis",
                  )}
                >
                  <Icon icon={Icons.X} className="text-lg" />
                </button>
              )}
            </div>
          </div>

          {/* ✅ FIXED FLARE USAGE */}
          {!props.hideTooltip && !focused && props.value.length === 0 && (
            <Flare.Light
              enabled={showTooltip}
              backgroundClass="rounded-full"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
          )}
        </div>

        <SearchFilterPopup
          isOpen={showFilterPopup}
          onClose={() => setShowFilterPopup(false)}
          onApplyFilters={handleFilterApply}
          anchorElement={filterButtonRef.current}
        />
      </>
    );
  },
);

SearchBarInput.displayName = "SearchBarInput";
