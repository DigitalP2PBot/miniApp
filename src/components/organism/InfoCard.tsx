import React, { ReactNode } from "react";

type  Props = {
    content: ReactNode
}

const InfoCard: React.FC<Props> = ({content}) => (
    <section id="step-pending" className="bg-customGrayWallet m-0 rounded-lg p-4 pb-4 text-left">
        {content}
    </section>
)

export default InfoCard;
