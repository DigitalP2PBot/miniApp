import React, { ReactNode } from "react";

type StatusType = "info" | "pending" | "success" | "error";

type  Props = {
    content: ReactNode,
    type?: StatusType ,
}

const StatusLabel: React.FC<Props> = ({content, type="info"}) => {
    const BorderByYype = getBorderByType(type);
    const IconByType = getIconByType(type);
    return (
    <p className={`mt-0 mr-0 mb-4 ml-0 text-left flex ${BorderByYype}`}>
        <span>
            {IconByType}
        </span>
        <span>
            {content}
        </span>
    </p>
    );
}

const getBorderByType = (type:StatusType):string => {
    const borderMap = {
        info: "text-customGrayAlternative",
        pending: "text-orangePeel",
        success: "text-oceanGreen",
        error: "text-rose-600",
    };
    return borderMap[type] || "";
};

const getIconByType = (type: StatusType): ReactNode => {
    if(type == "pending"){
        return (
            <svg
                className="animate-spin h-5 w-5 mr-1 text-current"
                viewBox="0 0 24 24"
            >
                <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                />
                <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C3.4 0 0 5.4 0 12h4zm2 5.3l2.8 2.8A8 8 0 0112 20v-4c-2.2 0-4.2-1-5.7-2.7z"
                />
            </svg>
        )
    } else if( type== "success") {
        return (<svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1 text-current"
            viewBox="0 0 50 50"
        >
            <path
                stroke="currentColor"
                strokeWidth="4"
                fill="currentColor"
                d="M 25 2 C 12.317 2 2 12.317 2 25 C 2 37.683 12.317 48 25 48 C 37.683 48 48 37.683 48 25 C 48 20.44 46.660281 16.189328 44.363281 12.611328 L 42.994141 14.228516 C 44.889141 17.382516 46 21.06 46 25 C 46 36.579 36.579 46 25 46 C 13.421 46 4 36.579 4 25 C 4 13.421 13.421 4 25 4 C 30.443 4 35.393906 6.0997656 39.128906 9.5097656 L 40.4375 7.9648438 C 36.3525 4.2598437 30.935 2 25 2 z M 43.236328 7.7539062 L 23.914062 30.554688 L 15.78125 22.96875 L 14.417969 24.431641 L 24.083984 33.447266 L 44.763672 9.046875 L 43.236328 7.7539062 z"></path>
        </svg>)
    } else if( type == "error") {
        return (
            <svg 
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1 text-current"
                viewBox="0 0 21 21"
            >
                <g 
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    transform="translate(2 2)"
                >
                <circle cx="8.5" cy="8.5" r="8"/>
                <g transform="matrix(0 1 -1 0 17 0)">
                <path d="m5.5 11.5 6-6"/>
                <path d="m5.5 5.5 6 6"/>
                </g>
                </g>

            </svg>
        )
    } else {
        return (<svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1 text-current"
            viewBox="0 0 50 50"
        >
            <circle
                cx="25"
                cy="25"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="currentColor"
                />
        </svg>)
    }
} 

export default StatusLabel
