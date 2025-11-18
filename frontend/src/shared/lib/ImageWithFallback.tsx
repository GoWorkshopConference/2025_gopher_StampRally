"use client";

import React, {useEffect, useState} from "react";
import Image from "next/image";

const ERROR_IMG_SRC =
    "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

interface ImageWithFallbackProps {
    src: string;
    alt: string;
    className?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;
}

export function ImageWithFallback({src, alt, className, style, width, height}: ImageWithFallbackProps) {
    const [didError, setDidError] = useState(false);
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        // URLの妥当性チェック
        const isValidUrl = (url: string) => {
            if (!url) return false;
            if (url.startsWith("data:")) return true;
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        };

        if (!isValidUrl(src)) {
            setDidError(true);
            setImgSrc(ERROR_IMG_SRC);
            return;
        }

        setImgSrc(src);
        setDidError(false);

        // 画像の読み込みを事前にチェック
        if (src && !src.startsWith("data:")) {
            const testImg = new window.Image();
            testImg.onerror = () => {
                setDidError(true);
                setImgSrc(ERROR_IMG_SRC);
            };
            testImg.onload = () => {
                setDidError(false);
                setImgSrc(src);
            };
            testImg.src = src;
        }
    }, [src]);

    // エラー時もNext.js Imageコンポーネントを使用
    const displaySrc = didError ? ERROR_IMG_SRC : imgSrc;
    const displayAlt = didError ? "Error loading image" : alt;

    // base64データURIや任意のURLに対応するため、unoptimizedを使用
    // fillを使用する場合は親要素にrelativeが必要
    if (!width && !height) {
        return (
            <Image
                src={displaySrc}
                alt={displayAlt}
                fill
                unoptimized
                className={`object-cover ${className ?? ""}`}
                style={style}
            />
        );
    }

    return (
        <Image
            src={displaySrc}
            alt={displayAlt}
            width={width ?? 100}
            height={height ?? 100}
            className={className}
            style={style}
            unoptimized
        />
    );
}
