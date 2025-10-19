import React from "react";
import i18n from "../../configs/i18n";

type Props = {
  expectedNetwork: string;
  currentNetwork: string;
  onSwitchNetwork: () => void;
};

const NetworkMismatchWarning: React.FC<Props> = ({
  expectedNetwork,
  currentNetwork,
  onSwitchNetwork,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-4">
          <div className="mx-auto w-16 h-16 bg-orangePeel bg-opacity-10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-orangePeel"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-dimGray mb-2">
            {i18n.t("networkMismatchTitle")}
          </h3>
        </div>

        <div className="bg-azureishWhite rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-customGrayText">
              {i18n.t("currentNetwork")}:
            </span>
            <span className="text-sm font-medium text-dimGray">
              {currentNetwork}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-customGrayText">
              {i18n.t("requiredNetwork")}:
            </span>
            <span className="text-sm font-medium text-oceanGreen">
              {expectedNetwork}
            </span>
          </div>
        </div>

        <p className="text-sm text-customGrayText text-center mb-6">
          {i18n.t("networkMismatchDescription")}
        </p>

        <button
          onClick={onSwitchNetwork}
          className="w-full bg-oceanGreen text-white py-3 px-4 rounded-lg font-medium hover:bg-opacity-90 transition-all"
        >
          {i18n.t("switchNetworkButton")}
        </button>
      </div>
    </div>
  );
};

export default NetworkMismatchWarning;
