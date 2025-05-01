import  React, { useState } from 'react';
import { TransactionState } from '../../types';
import PrimaryButton from '../buttons/PrimaryButton';
import i18n from '../../configs/i18n';

type StatusProps = {
    status: TransactionState;
};


const StatusOverlay: React.FC<StatusProps> = ({ status }) => {
    const [ focusedApp, focusApp ] = useState(false);
    const showStatus = (status: TransactionState): boolean => {
        return status === TransactionState.APPROVED && !focusedApp;
    };

    return showStatus(status)? (
        <div className='relative z-10' aria-labelledby='Transaction Approved' role="dialog" aria-modal="true">
            <div className="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true"></div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg p-8 flex justify-center flex-col">
                        <h5 className="text-center font-bold mb-4">{i18n.t("transactionApproved")}</h5>
                        <p>{i18n.t("sendFunds")}</p>
                        <PrimaryButton className="mt-4" title={i18n.t("goToWallet")} callback={() => focusApp(true)}/>
                    </div>
                </div>
            </div>
        </div>
    ): null;
};
export default StatusOverlay;