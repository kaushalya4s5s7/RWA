import React, { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import ExpandableListingCard from './ExpandableListingCard';
import { ExpandedDetailView } from './ExpandedDetailView';
import { ListingItem } from './types';
import { CloseIcon } from './CloseIcon';

interface ListingGridProps {
  items: ListingItem[];
}

const ListingGrid: React.FC<ListingGridProps> = ({ items }) => {
  const [active, setActive] = useState<ListingItem | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ListingItem;
    direction: 'asc' | 'desc';
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof ListingItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-[100] p-4 overflow-auto">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.05 }
              }}
              className="flex absolute top-4 right-4 items-center justify-center bg-white rounded-full h-8 w-8 shadow-lg z-[101]"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>
            <div ref={ref} className="relative">
              <ExpandedDetailView {...active} onClose={() => setActive(null)} />
            </div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto w-full">
        {/* Headers */}
        <div className="grid grid-cols-7 gap-4 px-6 py-3 bg-gray-50 rounded-t-lg">
          <div className="col-span-2 flex items-center gap-2">
            <span className="font-medium">Assets</span>
            
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Price</span>
            <button 
              onClick={() => requestSort('price')}
              className="text-gray-500 hover:text-gray-700"
            >
              {sortConfig?.key === 'price' && sortConfig.direction === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Category</span>
            
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Type</span>
            
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Earn XP</span>
            <button 
              onClick={() => requestSort('earnXP')}
              className="text-gray-500 hover:text-gray-700"
            >
              {sortConfig?.key === 'earnXP' && sortConfig.direction === 'asc' ? '↑' : '↓'}
            </button>
          </div>
          <div className="flex items-center">
            <span className="font-medium">Actions</span>
          </div>
        </div>

        {/* List Items */}
        <ul className="divide-y divide-gray-100">
          {sortedItems.map((item) => (
            <motion.div
              layoutId={`card-${item.title}-${id}`}
              key={`card-${item.title}-${id}`}
              className="hover:bg-gray-50"
            >
              <ExpandableListingCard
                {...item}
                onClick={() => setActive(item)}
                isExpanded={active?.id === item.id}
              />
            </motion.div>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ListingGrid;
