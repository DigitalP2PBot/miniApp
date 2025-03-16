import React from "react";

type  Props = {
    label?: string
    content?: string
}

const InfoLabel: React.FC<Props> = ({label, content}) => {
    const contentLength = content?.length || 0;
    const shortedContent = contentLength > 50 ? `${content?.substring(0, 25)}...${content?.substring(contentLength -25, contentLength)}`: undefined;
    return (
        <div className="text-customGrayText mt-0 mr-0 mb-4 ml-0 text-left">
            <h4>{label} </h4>
            <span className="text-dimGray" title={shortedContent}>{shortedContent || content}</span>
        </div>
    )
}

export default InfoLabel;
