import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>{
    variant?:"primary" | "spotify";
    children:React.ReactNode;
}

export const Button =({variant="primary", children, className="",...props}:ButtonProps)=>{
    const baseStyle ="w-full py-3 px-4 font-bold text-white transition-colors shadow-lg flex items-center justify-center gap-2 "

    const variantStyle = variant === "spotify"
    ? "bg-spotify-green hover:bg-spotify-green/80"
    : "bg-purple-600 hover:bg-purple-500 rounded-md mt-2";

    return (
        <button
            className={`${baseStyle} ${variantStyle} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}