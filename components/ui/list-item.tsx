"use client";
import { motion, MotionConfig } from "motion/react";
import { Dispatch, SetStateAction, useState } from "react";
import clsx from "clsx";

import {
  Mic01Icon,
  Book02Icon,
  FileValidationIcon,
  Tick02Icon,
  FilterHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export type FilterKey = (typeof filterKeys)[number];

export const filterKeys = [
  {
    name: "Procyon Voice",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={Mic01Icon} size={size} />
    ),
  },
  {
    name: "Procyon Research",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={Book02Icon} size={size} />
    ),
  },
  {
    name: "Procyon Documentation",
    Icon: ({ size }: { size: number }) => (
      <HugeiconsIcon icon={FileValidationIcon} size={size} />
    ),
  },
];

function ListItem(props: {
  index: number;
  filterKey: FilterKey;
  selectedFilterKey: FilterKey;
  setSelectedFilterKey: Dispatch<SetStateAction<FilterKey>>;
  setIsOpened: Dispatch<SetStateAction<boolean>>;
  onSelect?: (key: FilterKey) => void;
}) {
  const {
    index,
    filterKey,
    selectedFilterKey,
    setSelectedFilterKey,
    setIsOpened,
    onSelect,
  } = props;
  const delay = (index + 8) * 0.025;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        bounce: 0.1,
        duration: 0.25,
        delay,
        ease: [0.215, 0.61, 0.355, 1],
      }}
      onClick={() => {
        setSelectedFilterKey(filterKey);
        setTimeout(() => {
          setIsOpened(false);
          onSelect?.(filterKey);
        }, 150);
      }}
      className="px-3 py-2.5 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-[#f5f5f3] text-[#2d2d2d] transition-colors"
    >
      <div className="flex items-center gap-x-3">
        <span className="text-[#a0a09b]">
          <filterKey.Icon size={24} />
        </span>
        <span className="text-[15px] font-medium">{filterKey.name}</span>
      </div>
      <div
        className={clsx(
          "relative w-6 h-6 overflow-hidden rounded-full",
          selectedFilterKey.name === filterKey.name
            ? "border-none"
            : "border-[2px] border-[#e0e0dc]"
        )}
      >
        {selectedFilterKey.name === filterKey.name && (
          <div className="absolute inset-0 bg-[#2d2d2d] flex justify-center items-center text-white">
            <HugeiconsIcon icon={Tick02Icon} size={16} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface FilterInteractionProps {
  onSelect?: (key: FilterKey) => void;
}

const FilterInteraction = ({ onSelect }: FilterInteractionProps) => {
  const [selectedFilterKey, setSelectedFilterKey] = useState(filterKeys[0]);
  const [isOpened, setIsOpened] = useState(false);

  return (
    <section className="flex justify-center items-center">
      <MotionConfig
        transition={{ type: "spring", duration: 0.85, bounce: 0.35 }}
      >
        <div
          onClick={() => setIsOpened(true)}
          className="relative left-2.5 w-20 h-20 flex justify-center items-center cursor-pointer"
        >
          <HugeiconsIcon
            icon={FilterHorizontalIcon}
            className="text-[#2d2d2d] relative z-10"
            size={36}
            style={{ fill: 'none' }}
          />
          <motion.div
            layoutId="wrapper"
            className="absolute inset-0 z-[2] bg-white border border-[#e8e8e4]"
            style={{ borderRadius: 40, borderWidth: 1 }}
          />
        </div>
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isOpened ? -20 : 0 }}
          transition={{ type: "spring", bounce: 0.3, duration: 1.5 }}
          className="relative right-2.5 w-20 h-20 border border-[#e8e8e4] rounded-full flex justify-center items-center bg-white"
        >
          <span className="text-[#a0a09b]">
            <selectedFilterKey.Icon size={36} />
          </span>
        </motion.div>

        {isOpened && (
          <motion.section
            layoutId="wrapper"
            className="absolute z-20 w-72 px-1 py-1 bg-white border border-[#e8e8e4] text-xl overflow-hidden shadow-lg shadow-black/[0.04]"
            style={{ borderRadius: 20, borderWidth: 1 }}
          >
            <div className="flex flex-col gap-1">
              {filterKeys.map((item, index) => (
                <ListItem
                  key={item.name}
                  index={index}
                  filterKey={item}
                  selectedFilterKey={selectedFilterKey}
                  setSelectedFilterKey={setSelectedFilterKey}
                  setIsOpened={setIsOpened}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </motion.section>
        )}
      </MotionConfig>
    </section>
  );
};

export default FilterInteraction;
