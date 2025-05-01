import React from "react";

type  Props = {
    label?: string
    content?: string
}

const CONTENT_LENGTH = 25;

const InfoLabel: React.FC<Props> = ({label, content}) => {
    const contentLength = content?.length || 0;
    const lengthShownCharacter = CONTENT_LENGTH/2;
    const shortedContent = contentLength > CONTENT_LENGTH ? `${content?.substring(0, lengthShownCharacter)}...${content?.substring(contentLength -lengthShownCharacter, contentLength)}`: undefined;
    return (
        <div className="text-customGrayText mt-0 mr-0 mb-4 ml-0 text-left">
            <h4>{label} </h4>
            <span className="text-dimGray" title={shortedContent?content:undefined}>{shortedContent || content}</span>
        </div>
    )
}

export default InfoLabel;
