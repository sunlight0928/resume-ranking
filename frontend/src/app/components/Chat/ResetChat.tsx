import { FC } from "react";

interface Props {
  onReset: () => void;
}

export const ResetChat: FC<Props> = ({ onReset }) => {
  return (
    <div className="flex flex-row items-center">
      <button
        className="text-sm sm:text-base text-white font-semibold rounded-lg px-4 py-2 bg-blue-500 hover:opacity-80 focus:outline-none focus:ring-1 focus:ring-neutral-300"
        onClick={() => onReset()}
      >
        Reset
      </button>
    </div>
  );
};
;
