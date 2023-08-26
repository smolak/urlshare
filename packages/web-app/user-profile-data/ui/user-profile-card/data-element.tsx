import { FC } from "react";

type DataElementProps = {
  name: string;
  value: string | number;
};

/**
 * <div className="grid grid-cols-2 grid-rows-2 gap-x-14 gap-y-4 text-center text-sm">
 * <div className="rounded p-1 hover:bg-slate-100">
 *               <span className="font-extrabold">TBA</span>
 *               <br />
 *               <span className="text-xs text-gray-400">URLs</span>
 *             </div>
 * @param name
 * @param value
 * @constructor
 */

export const DataElement: FC<DataElementProps> = ({ name, value }) => {
  return (
    <div className="grid grid-cols-2 gap-1.5 md:block md:grid-rows-2">
      <span className="text-sm font-bold max-md:text-right md:block md:font-extrabold">{value}</span>
      <span className="text-gray-400 max-md:text-sm md:text-xs">{name}</span>
    </div>
  );
};
